#!/usr/bin/env python3
"""Check that the About screenshot contains the dialog's identifying text."""
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageEnhance, ImageOps


def missing_dialog_text(text: str, version: str) -> list[str]:
    normalized = " ".join(text.casefold().split())
    version_pattern = r"\s*\.\s*".join(re.escape(part) for part in version.split("."))
    checks = {
        "application name": r"\bplunibio\b",
        "version label and value": rf"\bversion\s+{version_pattern}(?!\d)",
        "MIT license link": r"\bmit\s+licen[sc]e\b",
        "homepage link": r"\bhomepage\b",
    }
    return [name for name, pattern in checks.items() if not re.search(pattern, normalized)]


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: verify-about.py SCREENSHOT", file=sys.stderr)
        return 2
    screenshot = Path(sys.argv[1])
    version = json.loads(Path("package.json").read_text(encoding="utf-8"))["version"]
    executable = shutil.which("tesseract")
    if not executable and os.name == "nt":
        candidate = Path(os.environ["ProgramFiles"]) / "Tesseract-OCR" / "tesseract.exe"
        if candidate.is_file():
            executable = str(candidate)
    if not executable:
        print("Tesseract OCR is not installed or not on PATH", file=sys.stderr)
        return 1
    # Small dialog text gets lost when OCR processes the full desktop at its
    # original resolution. Enlarge it and increase contrast before recognition.
    with tempfile.TemporaryDirectory(prefix="plunibio-about-ocr-") as tempdir:
        prepared = Path(tempdir) / "about-enlarged.png"
        with Image.open(screenshot) as original:
            image = ImageOps.grayscale(original)
            image = ImageEnhance.Contrast(image).enhance(1.5)
            image = image.resize((image.width * 3, image.height * 3), Image.Resampling.LANCZOS)
            image.save(prepared)
        logs = []
        for mode in ("11", "6"):
            result = subprocess.run(
                [executable, str(prepared), "stdout", "-l", "eng", "--psm", mode],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
            )
            logs.append(f"--- OCR mode {mode} (exit {result.returncode}) ---\n{result.stdout}\n{result.stderr}")
            if result.returncode == 0 and not missing_dialog_text(result.stdout, version):
                screenshot.with_name("about-ocr.txt").write_text("\n".join(logs), encoding="utf-8")
                print(f"About dialog verified in screenshot (version {version}, OCR mode {mode}).")
                return 0
        screenshot.with_name("about-ocr.txt").write_text("\n".join(logs), encoding="utf-8")
        print("About dialog not verified. See about.png and about-ocr.txt.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
