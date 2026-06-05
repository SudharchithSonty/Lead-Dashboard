#!/usr/bin/env bash
# Reliable dev startup: backend must be healthy before the frontend starts.
set -euo pipefail

ROOT="$(cd "${0%/*}/.." && pwd)"
cd "$ROOT"

PYTHON="${ROOT}/.venv/bin/python"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
HEALTH_URL="http://127.0.0.1:${BACKEND_PORT}/health"
BACKEND_PID=""

if [[ ! -x "$PYTHON" ]]; then
  echo "✗ Missing virtualenv. Run: make setup"
  exit 1
fi

port_in_use() {
  lsof -ti ":$1" >/dev/null 2>&1
}

cleanup() {
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "→ Stopping backend (pid $BACKEND_PID) …"
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

wait_for_backend() {
  local attempt
  for attempt in $(seq 1 40); do
    if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
      return 0
    fi
    if [[ -n "$BACKEND_PID" ]] && ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      echo "✗ Backend exited before ${HEALTH_URL} became healthy."
      echo "  Check errors above (venv, .env, import failures, port ${BACKEND_PORT})."
      return 1
    fi
    sleep 0.25
  done
  echo "✗ Backend not healthy after 10s at ${HEALTH_URL}"
  return 1
}

start_backend() {
  if port_in_use "$BACKEND_PORT"; then
    echo "→ Backend already on :${BACKEND_PORT} — stopping it …"
    lsof -ti ":${BACKEND_PORT}" | xargs kill 2>/dev/null || true
    local wait_secs=0
    while port_in_use "$BACKEND_PORT"; do
      sleep 0.2
      (( wait_secs++ ))
      if (( wait_secs > 25 )); then
        echo "✗ Port ${BACKEND_PORT} did not free up after 5s."
        exit 1
      fi
    done
    echo "  Port ${BACKEND_PORT} is now free."
  fi

  echo "→ Starting backend on :${BACKEND_PORT} …"
  cd "${ROOT}/backend"
  "$PYTHON" -m uvicorn app.main:app --reload --host 0.0.0.0 --port "$BACKEND_PORT" &
  BACKEND_PID=$!
  cd "$ROOT"

  wait_for_backend
  echo "✔ Backend ready — ${HEALTH_URL}"
}

start_frontend() {
  if port_in_use "$FRONTEND_PORT"; then
    echo "⚠ Port ${FRONTEND_PORT} is already in use."
    echo "  If the dashboard is not loading, stop the old process:"
    echo "  lsof -ti :${FRONTEND_PORT} | xargs kill"
  fi
  echo "→ Starting frontend on :${FRONTEND_PORT} …"
  echo "  Open http://localhost:${FRONTEND_PORT}"
  cd "${ROOT}/frontend"
  npm run dev:internal
}

echo "Lead Distribution Portal — dev mode"
echo "  Backend:  http://localhost:${BACKEND_PORT}"
echo "  Frontend: http://localhost:${FRONTEND_PORT}"
echo ""

start_backend
start_frontend
