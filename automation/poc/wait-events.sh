#!/bin/bash
# Source after defining pid and results. Each run starts with a fresh application.log.
wait_event() {
  local event="$1" timeout_seconds="${2:-60}" i
  for ((i=0; i<timeout_seconds; i++)); do
    if grep -F -- "$event" "$results/application.log" 2>/dev/null |
      grep -F -- "${3:-}" | grep -F -- "${4:-}" | grep -F -- "${5:-}" >/dev/null; then
      echo "Verified event: $event"
      return 0
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "Application exited while waiting for $event" >&2
      cat "$results/application.log" >&2
      return 1
    fi
    sleep 1
  done
  echo "Timed out waiting for $event" >&2
  cat "$results/application.log" >&2
  return 1
}
