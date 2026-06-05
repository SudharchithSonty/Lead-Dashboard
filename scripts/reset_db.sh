#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"

DB_FILE="$BACKEND_DIR/../leads.db"

echo "Resetting database..."

# Remove the existing SQLite file if it exists
if [[ -f "$DB_FILE" ]]; then
    rm "$DB_FILE"
    echo "Removed $DB_FILE"
fi

# Recreate schema via SQLAlchemy's metadata.create_all
(
    cd "$BACKEND_DIR"
    python - <<'EOF'
import sys
sys.path.insert(0, ".")
from app.db import engine
from app.models import Base
Base.metadata.create_all(bind=engine)
print("Schema created.")
EOF
)

echo "Done. Database reset to a clean state."
