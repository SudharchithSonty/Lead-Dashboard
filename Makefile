PYTHON   := python3.13
VENV     := .venv
PIP      := $(VENV)/bin/pip
PYTEST   := $(VENV)/bin/pytest
UVICORN  := $(VENV)/bin/uvicorn
RUFF     := $(VENV)/bin/ruff
MYPY     := $(VENV)/bin/mypy

.PHONY: setup setup-backend setup-frontend dev backend-dev frontend-dev test test-backend test-frontend lint type-check verify clean

# ── Setup ───────────────────────────────────────────────────────────
setup: setup-backend setup-frontend
	@echo "\n✔ Setup complete. Copy .env.example → .env and fill in your HubSpot credentials.\n"

setup-backend:
	@command -v $(PYTHON) >/dev/null 2>&1 || { echo "$(PYTHON) not found. Install Python 3.13 first."; exit 1; }
	$(PYTHON) -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r backend/requirements-dev.txt

setup-frontend:
	cd frontend && npm install

# ── Development ─────────────────────────────────────────────────────
dev:
	@echo "Starting backend on :8000 and frontend on :3000 …"
	$(MAKE) -j2 backend-dev frontend-dev

backend-dev:
	cd backend && ../$(VENV)/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend-dev:
	cd frontend && npm run dev

# ── Testing ─────────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	cd backend && ../$(PYTEST) tests/ -x --tb=short -q

test-frontend:
	cd frontend && npm test -- --run

# ── Static Analysis ─────────────────────────────────────────────────
lint:
	cd backend && ../$(RUFF) check .
	cd frontend && npm run lint

type-check:
	cd backend && ../$(MYPY) app --strict --ignore-missing-imports
	cd frontend && npx tsc --noEmit

# ── Full Verification ───────────────────────────────────────────────
verify: lint type-check test
	@echo "\n── Anti-pattern audit ──"
	@! grep -r "MAX(id" ./backend/app || { echo "FAIL: Manual ID generation found"; exit 1; }
	@! grep -r "StaticPool" ./backend/app || { echo "FAIL: StaticPool found"; exit 1; }
	@! grep -r 'allow_origins=\["\*"\]' ./backend/app || { echo "FAIL: Wildcard CORS found"; exit 1; }
	@echo "✔ All verification gates passed."

# ── Cleanup ─────────────────────────────────────────────────────────
clean:
	rm -rf $(VENV) backend/__pycache__ backend/app/__pycache__ backend/tests/__pycache__
	rm -rf frontend/.next frontend/node_modules
	rm -f backend/*.db
