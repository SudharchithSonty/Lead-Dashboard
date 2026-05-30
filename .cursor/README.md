# Distributed Data Watcher Service

## Design Notes

The assessment specifies SQLite for persistence. This implementation uses **PostgreSQL 16**
instead: this is done for safe concurrent writes
from multiple async workers, and a clearer path toward horizontal scaling. "Moving average" is interpreted as the **arithmetic mean** of all `value` entries within a
single file — a per-file batch summary rather than a rolling window across files.

See [ARCHITECTURE_DETAILS.md](ARCHITECTURE_DETAILS.md) for full architectural choices,
data-flow diagrams, failure handling, and the scaling strategy for 10,000 files/minute.

## Run Instructions

### 1) Set up local environment

```bash
python3.13 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### 2) Start PostgreSQL 16

```bash
docker compose up -d postgres
```

### 3) Run tests

```bash
python -m pytest -v
```

### 3b) Run via Makefile (recommended)

```bash
# Install dev dependencies
make install-dev

# Security + lint + types + full test suite
make verify-security

# PostgreSQL integration tests (custom DSN example)
make test-db PG_DSN="postgresql://watcher:watcher_dev@localhost:6432/telemetry"

# Everything in one command
make verify-all PG_DSN="postgresql://watcher:watcher_dev@localhost:6432/telemetry"
```

### 4) Process files once and exit

```bash
python -m log_analyzer --once
```

### 5) Run continuous watcher

```bash
python -m log_analyzer
```

### 6) Run with Docker

```bash
docker compose up --build
```
