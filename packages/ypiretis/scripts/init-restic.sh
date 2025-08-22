#!/usr/bin/env sh

set -e

SCRIPTS_DIRECTORY="${SCRIPTS_DIRECTORY:-/usr/local/bin}"

echo "--- Starting Full Repository Initialization ---"

echo "[1/2] Initializing encrypted SQLite3 repository..."
"$SCRIPTS_DIRECTORY/init-restic-sqlite3.sh"

echo ""

echo "[2/2] Initializing encrypted uploads repository..."
"$SCRIPTS_DIRECTORY/init-restic-uploads.sh"

echo "--- All Repositories Initialized Successfully ---"