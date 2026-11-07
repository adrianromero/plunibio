#!/usr/bin/env python3
"""Check that the About screenshot contains the dialog's identifying text."""
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys


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
    result = subprocess.run(
        [executable, str(screenshot), "stdout", "-l", "eng", "--psm", "11"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    screenshot.with_name("about-ocr.txt").write_text(result.stdout + "\n" + result.stderr, encoding="utf-8")
    if result.returncode:
        print(f"About screenshot OCR failed: {result.stderr}", file=sys.stderr)
        return 1
    missing = missing_dialog_text(result.stdout, version)
    if missing:
        print(f"About dialog not verified; missing: {', '.join(missing)}. See about.png and about-ocr.txt.", file=sys.stderr)
        return 1
    print(f"About dialog verified in screenshot (version {version}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
