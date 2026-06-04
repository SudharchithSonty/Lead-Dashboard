# macOS-only: suppress MallocStackLogging libc diagnostics from IDE/debugger-inherited env.
# Sourced by scripts/run.sh, scripts/dev.sh, and frontend/scripts/dev.sh.
#
# Not caused by application Python/TypeScript — triggered when the shell inherits variables
# such as MallocStackLogging or MallocNanoZone=0 (common in Cursor/Xcode terminals) and
# then spawns ANY subprocess (node, python, curl, etc.).

_darwin() {
  [[ "${OSTYPE:-}" == darwin* ]]
}

macos_sanitize_malloc_env() {
  if ! _darwin; then
    return 0
  fi

  unset MallocStackLogging MallocStackLoggingNoCompact MallocScribble MallocPreScribble 2>/dev/null || true
  unset MallocGuardEdges MallocDoNotProtectPrelude MallocErrorAbort 2>/dev/null || true
  export MallocStackLogging=0
  if [[ "${MallocNanoZone-}" == "0" ]]; then
    unset MallocNanoZone
  fi
}

macos_filter_malloc_stderr() {
  while IFS= read -r line || [[ -n "${line:-}" ]]; do
    if [[ "$line" == *MallocStackLogging:* ]]; then
      continue
    fi
    printf '%s\n' "$line" >&2
  done
}

macos_exec_sanitized() {
  macos_sanitize_malloc_env
  if _darwin; then
    { "$@"; } 2> >(macos_filter_malloc_stderr)
  else
    "$@"
  fi
}

macos_exec_sanitized_background() {
  macos_sanitize_malloc_env
  if _darwin; then
    "$@" 2> >(macos_filter_malloc_stderr >&2) &
  else
    "$@" &
  fi
}
