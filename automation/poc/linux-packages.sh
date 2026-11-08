#!/bin/bash
set -euo pipefail

task_root="${RUNNER_TEMP:?}/plunibio-input-poc"
results="$task_root/results"
workspace="$task_root/workspace"
mkdir -p "$results" "$workspace" "$task_root/apps" "$task_root/home"
exec > >(tee -a "$results/linux.log") 2>&1
pid=""
cleanup() {
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; fi
}
trap cleanup EXIT
shopt -s nullglob
debs=(src-tauri/target/release/bundle/deb/*.deb)
images=(src-tauri/target/release/bundle/appimage/*.AppImage)
[[ ${#debs[@]} -eq 1 && ${#images[@]} -eq 1 ]] || { echo 'Expected one .deb and one AppImage' >&2; exit 1; }

package=$(dpkg-deb -f "${debs[0]}" Package)
sudo apt-get install -y "$(realpath "${debs[0]}")"
dpkg-query -W -f='${Status}\n' "$package" | grep -Fx 'install ok installed'
sudo apt-get remove -y "$package"
if dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q 'install ok installed'; then
  echo 'Debian package is still installed' >&2; exit 1
fi

image="$task_root/apps/Plunibio.AppImage"
cp "${images[0]}" "$image"
chmod +x "$image"
test ! -e "$workspace/smoke.md"
HOME="$task_root/home" GDK_BACKEND=x11 RUST_LOG=debug "$image" --base-path "$workspace" --width 850 --height 700 >"$results/application.log" 2>&1 &
pid=$!
source automation/poc/wait-events.sh
window=$(timeout 60s xdotool search --sync --onlyvisible --pid "$pid" | head -1)
xdotool windowfocus --sync "$window"
wait_event 'lifecycle_event=app.started'
wait_event 'frontend_event=workspace.ready'
echo 'Creating Markdown in the workspace.'
xdotool key --clearmodifiers ctrl+shift+m
wait_event 'frontend_event=entry_dialog.opened;' 60 '"kind":"markdown"'
xdotool type --clearmodifiers --delay 75 'smoke'
xdotool key --clearmodifiers Return
wait_event 'frontend_event=entry.created;' 60 '"kind":"markdown"'
wait_event 'frontend_event=editor.focused;' 60 '"editor":"EditorMarkdown"' '"connected":true' '"focused":true'
test -f "$workspace/smoke.md"
xdotool windowfocus --sync "$window"
xdotool type --clearmodifiers --delay 75 'Plunibio smoke test'
wait_event 'frontend_event=editor.changed;' 60 '"editor":"EditorMarkdown"' '"state":"ready"'
import -window root "$results/screen.png"
xdotool key --clearmodifiers ctrl+s
wait_event 'frontend_event=editor.saved;' 60 '"editor":"EditorMarkdown"'
[[ -f "$workspace/smoke.md" ]] && cp "$workspace/smoke.md" "$results/smoke.md"
grep -Fq 'Plunibio smoke test' "$workspace/smoke.md"
echo 'Opening About through the toolbar menu.'
eval "$(xdotool getwindowgeometry --shell "$window")"
# Under Xvfb the window has no native title bar: the toolbar is at y=25.
xdotool mousemove --window "$window" "$((WIDTH - 26))" 25 click 1
sleep 1
xdotool key --clearmodifiers Escape
xdotool key --clearmodifiers space
sleep 1
xdotool key --clearmodifiers End Return
wait_event 'frontend_event=about.opened'
expected_version=$(python3 -c 'import json; print(json.load(open("package.json"))["version"])')
wait_event 'frontend_event=about.metadata;' 60 "\"version\":\"$expected_version\""
import -window root "$results/about.png"
test -s "$results/about.png"
xdotool key Escape
wait_event 'frontend_event=about.closed'
echo 'Requesting a normal X11 window close.'
python3 automation/poc/x11-close.py "$window"
for _ in {1..15}; do kill -0 "$pid" 2>/dev/null || break; sleep 1; done
if kill -0 "$pid" 2>/dev/null; then echo 'Application did not close' >&2; exit 1; fi
wait "$pid"
pid=""
grep -Fq 'lifecycle_event=app.window.closed' "$results/application.log"
rm -f "$image"
test ! -e "$image"
echo 'AppImage input, save, close and removal verified.'
