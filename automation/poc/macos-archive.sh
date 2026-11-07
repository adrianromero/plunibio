#!/bin/bash
set -euo pipefail

task_root="${RUNNER_TEMP:?}/plunibio-input-poc"
results="$task_root/results"
mkdir -p "$results" "$task_root/archive-install"
exec > >(tee -a "$results/archive.log") 2>&1
shopt -s nullglob
archives=(src-tauri/target/release/bundle/macos/*.app.tar.gz)
if [[ ${#archives[@]} -ne 1 ]]; then
  echo "Expected one archive produced by tauri-action, found ${#archives[@]}" >&2
  exit 1
fi
tar -xzf "${archives[0]}" -C "$task_root/archive-install"
apps=("$task_root/archive-install"/*.app)
if [[ ${#apps[@]} -ne 1 || ! -x "$task_root/archive-install/Plunibio.app/Contents/MacOS/plunibio" ]]; then
  echo "The archive did not install a usable Plunibio.app." >&2
  exit 1
fi
file "$task_root/archive-install/Plunibio.app/Contents/MacOS/plunibio"
rm -rf "$task_root/archive-install/Plunibio.app"
test ! -e "$task_root/archive-install/Plunibio.app"
echo "Archive installation and removal verified."
