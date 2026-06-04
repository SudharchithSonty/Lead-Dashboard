PYTHON   := python3.13
VENV     := .venv
PIP      := $(VENV)/bin/pip
PYTEST   := $(VENV)/bin/pytest
UVICORN  := $(VENV)/bin/uvicorn
RUFF     := $(VENV)/bin/ruff
MYPY     := $(VENV)/bin/mypy
RUN      := bash scripts/run.sh

.PHONY: setup setup-backend setup-frontend dev backend-dev frontend-dev test test-backend test-frontend lint type-check verify clean

# ── Setup ───────────────────────────────────────────────────────────
setup: setup-backend setup-frontend
	@echo "\n✔ Setup complete. Copy .env.example → .env and fill in your HubSpot credentials.\n"

setup-backend:
	@$(RUN) bash -c 'command -v $(PYTHON) >/dev/null 2>&1 || { echo "$(PYTHON) not found. Install Python 3.13 first."; exit 1; }; \
		$(PYTHON) -m venv $(VENV) && \
		$(PIP) install --upgrade pip && \
		$(PIP) install -r backend/requirements-dev.txt'

setup-frontend:
	@$(RUN) bash -c 'cd frontend && npm install'

# ── Development ─────────────────────────────────────────────────────
dev:
	@$(RUN) scripts/dev.sh

backend-dev:
	@$(RUN) bash -c 'cd backend && ../$(VENV)/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000'

frontend-dev:
	@$(RUN) bash -c 'cd frontend && npm run dev'

# ── Testing ─────────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	@$(RUN) bash -c 'cd backend && ../$(PYTEST) tests/ -x --tb=short -q'

test-frontend:
	@$(RUN) bash -c 'cd frontend && npm test -- --run'

# ── Static Analysis ─────────────────────────────────────────────────
lint:
	@$(RUN) bash -c 'cd backend && ../$(RUFF) check .'
	@$(RUN) bash -c 'cd frontend && npm run lint'

type-check:
	@$(RUN) bash -c 'cd backend && ../$(MYPY) app --strict --ignore-missing-imports'
	@$(RUN) bash -c 'cd frontend && npm run type-check'

# ── Full Verification ───────────────────────────────────────────────
verify: lint type-check test
	@echo "\n── Anti-pattern audit ──"
	@$(RUN) bash -c '! grep -r "MAX(id" ./backend/app' || { echo "FAIL: Manual ID generation found"; exit 1; }
	@$(RUN) bash -c '! grep -r "StaticPool" ./backend/app' || { echo "FAIL: StaticPool found"; exit 1; }
	@$(RUN) bash -c '! grep -r '\''allow_origins=\["\*"\]'\'' ./backend/app' || { echo "FAIL: Wildcard CORS found"; exit 1; }
	@echo "✔ All verification gates passed."

# ── Cleanup ─────────────────────────────────────────────────────────
clean:
	rm -rf $(VENV) backend/__pycache__ backend/app/__pycache__ backend/tests/__pycache__
	rm -rf frontend/.next frontend/node_modules
	rm -f backend/*.db
