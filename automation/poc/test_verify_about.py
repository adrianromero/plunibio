import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("verify_about", Path(__file__).with_name("verify-about.py"))
assert spec and spec.loader
verify_about = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify_about)


class AboutRecognitionTest(unittest.TestCase):
    def test_dialog_text(self):
        text = "Plunibio\nVersion 0.1.3\nHomepage     MIT License\nClose"
        self.assertEqual(verify_about.missing_dialog_text(text, "0.1.3"), [])

    def test_editor_or_menu_is_not_a_dialog(self):
        for text in ("Plunibio smoke test", "About Plunibio", "Spotlight Search"):
            self.assertTrue(verify_about.missing_dialog_text(text, "0.1.3"))

    def test_wrong_version_is_rejected(self):
        text = "Plunibio Version 0.1.30 Homepage MIT License"
        self.assertIn("version label and value", verify_about.missing_dialog_text(text, "0.1.3"))


if __name__ == "__main__":
    unittest.main()
