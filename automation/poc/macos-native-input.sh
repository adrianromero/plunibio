#!/bin/bash
set -euo pipefail

task_root="${RUNNER_TEMP:?RUNNER_TEMP must be set}/plunibio-input-poc"
results="$task_root/results"
workspace="$task_root/workspace"
mkdir -p "$results" "$workspace" "$task_root/apps" "$task_root/home"
exec > >(tee -a "$results/runner.log") 2>&1
stage="initialization"
trap 'status=$?; echo "Failed at stage: $stage (line $LINENO, exit $status)" >&2' ERR
mountpoint="$task_root/mounted-dmg"
pid=""
cleanup() {
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
  hdiutil detach "$mountpoint" -quiet 2>/dev/null || true
  if [[ -d "$task_root/apps/Plunibio.app" ]]; then
    rm -rf "$task_root/apps/Plunibio.app"
  fi
}
trap cleanup EXIT

stage="find DMG"
shopt -s nullglob
dmgs=(src-tauri/target/release/bundle/dmg/*.dmg)
if [[ ${#dmgs[@]} -ne 1 ]]; then
  echo "Expected exactly one DMG, found ${#dmgs[@]}" >&2
  exit 1
fi
stage="mount DMG"
mkdir -p "$mountpoint"
echo "Mounting ${dmgs[0]} at $mountpoint"
# The DMG contains Plunibio's MIT license, which hdiutil asks to accept on stdin.
printf 'Y\n' | hdiutil attach "${dmgs[0]}" -readonly -nobrowse -mountpoint "$mountpoint"
stage="find application in DMG"
apps=("$mountpoint"/*.app)
if [[ ${#apps[@]} -ne 1 ]]; then
  echo "Expected exactly one application in the DMG, found ${#apps[@]}" >&2
  exit 1
fi
stage="copy application from DMG"
echo "Copying ${apps[0]}"
ditto "${apps[0]}" "$task_root/apps/Plunibio.app"
stage="detach DMG"
hdiutil detach "$mountpoint"

stage="verify application executable"
binary="$task_root/apps/Plunibio.app/Contents/MacOS/plunibio"
if [[ ! -x "$binary" ]]; then
  echo "Application executable is missing or not executable: $binary" >&2
  ls -la "$task_root/apps/Plunibio.app/Contents/MacOS" >&2 || true
  exit 1
fi
file "$binary" | tee "$results/architecture.txt"
stage="compile native input helper"
swiftc automation/poc/macos-native-input.swift -o "$task_root/native-input"
stage="launch application"
HOME="$task_root/home" "$binary" --base-path "$workspace" --width 850 --height 700 smoke.md >"$results/application.log" 2>&1 &
pid=$!

stage="wait for document loading"
document_loading=false
for _ in {1..60}; do
  if grep -Fq 'Reading smoke.md' "$results/application.log"; then
    document_loading=true
    break
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "Application exited before starting to load the document." >&2
    exit 1
  fi
  sleep 1
done
if [[ "$document_loading" != true ]]; then
  echo "Timed out waiting for the application to load smoke.md." >&2
  exit 1
fi
# The read log precedes Milkdown initialization. Allow it to finish before typing;
# this is a POC heuristic, not an editor-ready signal.
echo "Document read started; allowing time for the editor to initialize."
sleep 5

stage="send native input"
set +e
"$task_root/native-input" "$pid" >"$results/input.log" 2>&1
input_status=$?
set -e
sleep 2
stage="capture screen"
capture_status=0
screencapture -x "$results/screen.png" >"$results/capture.log" 2>&1 || capture_status=$?
if [[ $capture_status -ne 0 || ! -s "$results/screen.png" ]]; then
  echo "Could not capture the screen (exit $capture_status)." | tee -a "$results/capture.log" >&2
  capture_status=1
fi
if [[ $input_status -ne 0 ]]; then
  cat "$results/input.log" >&2
  exit "$input_status"
fi
if [[ $capture_status -ne 0 ]]; then
  exit "$capture_status"
fi

stage="verify saved markdown"
for _ in {1..20}; do
  if [[ -f "$workspace/smoke.md" ]] && grep -Fq 'Plunibio smoke test' "$workspace/smoke.md"; then
    cp "$workspace/smoke.md" "$results/smoke.md"
    stage="open and capture about"
    "$task_root/native-input" "$pid" --about-menu >>"$results/input.log" 2>&1
    screencapture -x "$results/menu.png" >>"$results/capture.log" 2>&1
    "$task_root/native-input" "$pid" --about-select "$results/menu.png" >>"$results/input.log" 2>&1
    sleep 2
    screencapture -x "$results/about.png" >>"$results/capture.log" 2>&1
    test -s "$results/about.png"
    echo "Native input and save verified; requesting normal termination."
    "$task_root/native-input" "$pid" --quit
    for _ in {1..15}; do
      kill -0 "$pid" 2>/dev/null || break
      sleep 1
    done
    if kill -0 "$pid" 2>/dev/null; then
      echo "Application did not close normally." >&2
      exit 1
    fi
    wait "$pid"
    pid=""
    rm -rf "$task_root/apps/Plunibio.app"
    test ! -e "$task_root/apps/Plunibio.app"
    echo "DMG application closed and removed."
    exit 0
  fi
  sleep 1
done
if [[ -f "$workspace/smoke.md" ]]; then
  cp "$workspace/smoke.md" "$results/smoke.md"
fi
echo "The expected text was not saved; inspect input.log, application.log and screen.png." >&2
exit 1
