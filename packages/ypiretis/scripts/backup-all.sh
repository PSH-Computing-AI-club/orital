#!/usr/bin/env sh

set -e

if [ "$LOCK_ACQUIRED" != "true" ]; then
    echo "Attempting to acquire backup lock..."
    exec flock -n /tmp/backup.lock -c "LOCK_ACQUIRED=true $0"
fi

echo "Lock acquired. Starting backup."

SCRIPTS_DIRECTORY="${SCRIPTS_DIRECTORY:-$PWD}"

echo "--- Starting Full Backup Sequence ---"

echo "[1/2] Backing up SQLite3 database..."
"$SCRIPTS_DIRECTORY/backup-sqlite3.sh"

echo ""

echo "[2/2] Backing up uploads..."
"$SCRIPTS_DIRECTORY/backup-uploads.sh"


echo "--- Full Backup Sequence Finished Successfully ---"