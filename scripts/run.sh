#!/usr/bin/env bash
# Universal command wrapper for Makefile and npm scripts.
# Usage: scripts/run.sh <command> [args...]
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: scripts/run.sh <command> [args...]" >&2
  exit 1
fi

exec "$@"
