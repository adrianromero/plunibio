import AppKit
import ApplicationServices
import CoreGraphics
import Foundation

guard (2...3).contains(CommandLine.arguments.count), let pid = pid_t(CommandLine.arguments[1]) else {
    fatalError("Usage: macos-native-input <application-pid> [--quit]")
}
if CommandLine.arguments.count == 3 {
    guard CommandLine.arguments[2] == "--quit", let app = NSRunningApplication(processIdentifier: pid), app.terminate() else {
        fputs("Could not request normal application termination.\n", stderr)
        exit(1)
    }
    exit(0)
}

guard AXIsProcessTrusted() else {
    fputs("Accessibility permission is unavailable to the input process.\n", stderr)
    exit(1)
}

let deadline = Date().addingTimeInterval(45)
var targetBounds: CGRect?
while Date() < deadline {
    let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
    for window in windows {
        guard let owner = window[kCGWindowOwnerPID as String] as? Int, owner == Int(pid),
              let layer = window[kCGWindowLayer as String] as? Int, layer == 0,
              let bounds = window[kCGWindowBounds as String] as? [String: Any],
              let rect = CGRect(dictionaryRepresentation: bounds as CFDictionary), rect.width >= 400, rect.height >= 300 else { continue }
        targetBounds = rect
        break
    }
    if targetBounds != nil { break }
    Thread.sleep(forTimeInterval: 0.5)
}
guard targetBounds != nil, let app = NSRunningApplication(processIdentifier: pid) else {
    fputs("Application window did not appear.\n", stderr)
    exit(1)
}
app.activate()
Thread.sleep(forTimeInterval: 3)

// The application focuses the Markdown editor after it finishes loading.
let input = Array("Plunibio smoke test".utf16)
for character in input {
    var unit = character
    guard let keyDown = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true),
          let keyUp = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false) else {
        fatalError("Could not create keyboard events")
    }
    keyDown.keyboardSetUnicodeString(stringLength: 1, unicodeString: &unit)
    keyUp.keyboardSetUnicodeString(stringLength: 1, unicodeString: &unit)
    keyDown.post(tap: .cghidEventTap)
    keyUp.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.05)
}
Thread.sleep(forTimeInterval: 1)
// macOS hardware key code 1 is S. Send the application's normal Save shortcut.
guard let saveDown = CGEvent(keyboardEventSource: nil, virtualKey: 1, keyDown: true),
      let saveUp = CGEvent(keyboardEventSource: nil, virtualKey: 1, keyDown: false) else {
    fatalError("Could not create save shortcut")
}
saveDown.flags = .maskCommand
saveUp.flags = .maskCommand
saveDown.post(tap: .cghidEventTap)
saveUp.post(tap: .cghidEventTap)
