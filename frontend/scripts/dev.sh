#!/usr/bin/env bash
set -euo pipefail

if [[ "${OSTYPE:-}" == darwin* ]]; then
  unset MallocStackLogging MallocStackLoggingNoCompact MallocScribble MallocPreScribble 2>/dev/null || true
  export MallocStackLogging=0
  [[ "${MallocNanoZone-}" == "0" ]] && unset MallocNanoZone
fi

_LIB_DIR="$(cd "${0%/*}/../../scripts/lib" && pwd)"
# shellcheck source=../../scripts/lib/macos_malloc_sanitize.sh
source "${_LIB_DIR}/macos_malloc_sanitize.sh"

cd "${0%/*}/.."
macos_exec_sanitized npx next dev "$@"
