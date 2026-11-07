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
HOME="$task_root/home" GDK_BACKEND=x11 "$image" --base-path "$workspace" --width 1024 --height 768 smoke.md >"$results/application.log" 2>&1 &
pid=$!
for _ in {1..60}; do
  grep -Fq 'Reading smoke.md' "$results/application.log" && break
  kill -0 "$pid" 2>/dev/null || { cat "$results/application.log" >&2; exit 1; }
  sleep 1
done
grep -Fq 'Reading smoke.md' "$results/application.log" || { echo 'Editor did not load' >&2; exit 1; }
sleep 5
window=$(timeout 30s xdotool search --sync --onlyvisible --pid "$pid" | head -1)
xdotool windowfocus --sync "$window"
xdotool type --clearmodifiers --delay 75 'Plunibio smoke test'
xdotool key --clearmodifiers ctrl+s
sleep 3
import -window root "$results/screen.png"
for _ in {1..20}; do
  if [[ -f "$workspace/smoke.md" ]] && grep -Fq 'Plunibio smoke test' "$workspace/smoke.md"; then break; fi
  sleep 1
done
[[ -f "$workspace/smoke.md" ]] && cp "$workspace/smoke.md" "$results/smoke.md"
grep -Fq 'Plunibio smoke test' "$workspace/smoke.md"
echo 'Requesting a normal X11 window close.'
python3 automation/poc/x11-close.py "$window"
for _ in {1..15}; do kill -0 "$pid" 2>/dev/null || break; sleep 1; done
if kill -0 "$pid" 2>/dev/null; then echo 'Application did not close' >&2; exit 1; fi
wait "$pid"
pid=""
rm -f "$image"
test ! -e "$image"
echo 'AppImage input, save, close and removal verified.'
