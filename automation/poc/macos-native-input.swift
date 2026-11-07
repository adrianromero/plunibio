import AppKit
import ApplicationServices
import CoreGraphics
import Foundation
import ImageIO
import Vision

guard (2...4).contains(CommandLine.arguments.count), let pid = pid_t(CommandLine.arguments[1]) else {
    fatalError("Usage: macos-native-input <application-pid> [--quit]")
}
if CommandLine.arguments.count == 3 && CommandLine.arguments[2] == "--quit" {
    guard let app = NSRunningApplication(processIdentifier: pid), app.terminate() else {
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
guard let bounds = targetBounds, let app = NSRunningApplication(processIdentifier: pid) else {
    fputs("Application window did not appear.\n", stderr)
    exit(1)
}
app.activate()
Thread.sleep(forTimeInterval: 3)

if CommandLine.arguments.count == 3 && CommandLine.arguments[2] == "--create" {
    // Control-Shift-M opens the folder's New Markdown dialog.
    guard let down = CGEvent(keyboardEventSource: nil, virtualKey: 46, keyDown: true),
          let up = CGEvent(keyboardEventSource: nil, virtualKey: 46, keyDown: false) else {
        fatalError("Could not create New Markdown shortcut")
    }
    down.flags = [.maskControl, .maskShift]
    up.flags = []
    down.post(tap: .cghidEventTap)
    up.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 2)
    // The dialog starts with .md and the caret before the extension.
    for character in "smoke".utf16 {
        var unit = character
        guard let keyDown = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true),
              let keyUp = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false) else {
            fatalError("Could not type file name")
        }
        keyDown.flags = []
        keyUp.flags = []
        keyDown.keyboardSetUnicodeString(stringLength: 1, unicodeString: &unit)
        keyUp.keyboardSetUnicodeString(stringLength: 1, unicodeString: &unit)
        keyDown.post(tap: .cghidEventTap)
        keyUp.post(tap: .cghidEventTap)
        Thread.sleep(forTimeInterval: 0.05)
    }
    guard let enterDown = CGEvent(keyboardEventSource: nil, virtualKey: 36, keyDown: true),
          let enterUp = CGEvent(keyboardEventSource: nil, virtualKey: 36, keyDown: false) else {
        fatalError("Could not confirm file name")
    }
    enterDown.flags = []
    enterUp.flags = []
    enterDown.post(tap: .cghidEventTap)
    enterUp.post(tap: .cghidEventTap)
    exit(0)
}

if CommandLine.arguments.count == 3 && CommandLine.arguments[2] == "--about-menu" {
    let point = CGPoint(x: bounds.maxX - 26, y: bounds.minY + 53)
    guard let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: point, mouseButton: .left),
          let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: point, mouseButton: .left) else {
        fatalError("Could not create menu click")
    }
    // The previous Save shortcut uses Command. Clear modifier flags so that
    // Space cannot be interpreted as Command-Space (Spotlight).
    down.flags = []
    up.flags = []
    down.post(tap: .cghidEventTap)
    up.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.5)
    exit(0)
}
if CommandLine.arguments.count == 4 && CommandLine.arguments[2] == "--about-select" {
    let imageURL = URL(fileURLWithPath: CommandLine.arguments[3]) as CFURL
    guard let source = CGImageSourceCreateWithURL(imageURL, nil),
          let screenshot = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        fatalError("Could not read menu screenshot")
    }
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    // The menu label is small relative to the full desktop screenshot,
    // particularly on the 1920×1080 Intel runner.
    request.minimumTextHeight = 0.003
    request.recognitionLanguages = ["en-US"]
    try VNImageRequestHandler(cgImage: screenshot).perform([request])
    for observation in request.results ?? [] {
        if let text = observation.topCandidates(1).first?.string {
            print("Menu OCR: \(text)")
        }
    }
    let candidates = (request.results ?? []).filter { observation in
        guard let text = observation.topCandidates(1).first?.string.lowercased() else { return false }
        return (text.contains("about") || text.contains("acerca")) && text.contains("plunibio")
    }
    guard candidates.count == 1, let match = candidates.first else {
        fputs("Could not uniquely find About Plunibio in menu screenshot.\n", stderr)
        exit(1)
    }
    // Vision uses normalized coordinates with the origin at the bottom left.
    let screen = CGDisplayBounds(CGMainDisplayID())
    let point = CGPoint(x: screen.minX + match.boundingBox.midX * screen.width,
                        y: screen.minY + (1 - match.boundingBox.midY) * screen.height)
    guard let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: point, mouseButton: .left),
          let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: point, mouseButton: .left) else {
        fatalError("Could not create About click")
    }
    down.flags = []
    up.flags = []
    down.post(tap: .cghidEventTap)
    up.post(tap: .cghidEventTap)
    exit(0)
}
if CommandLine.arguments.count > 2 { fatalError("Unknown action") }

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
saveUp.flags = []
saveDown.post(tap: .cghidEventTap)
saveUp.post(tap: .cghidEventTap)
