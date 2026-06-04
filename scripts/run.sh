#!/usr/bin/env bash
# Universal command wrapper for Makefile and npm scripts.
# Usage: scripts/run.sh <command> [args...]
set -euo pipefail

# Sanitize before any cd/source so no subprocess inherits debug malloc env.
if [[ "${OSTYPE:-}" == darwin* ]]; then
  unset MallocStackLogging MallocStackLoggingNoCompact MallocScribble MallocPreScribble 2>/dev/null || true
  export MallocStackLogging=0
  [[ "${MallocNanoZone-}" == "0" ]] && unset MallocNanoZone
fi

_LIB_DIR="$(cd "${0%/*}/lib" && pwd)"
# shellcheck source=lib/macos_malloc_sanitize.sh
source "${_LIB_DIR}/macos_malloc_sanitize.sh"

if [[ $# -lt 1 ]]; then
  echo "usage: scripts/run.sh <command> [args...]" >&2
  exit 1
fi

macos_sanitize_malloc_env
macos_exec_sanitized "$@"
