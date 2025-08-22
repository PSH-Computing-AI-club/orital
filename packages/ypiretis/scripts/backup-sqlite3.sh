#!/usr/bin/env sh

set -e

if [ -z "$BUCKET_REPOSITORY" ] || [ -z "$BUCKET_SQLITE3_TAG" ] || \
   [ -z "$DATA_SQLITE3_FILE" ] || [ -z "$RESTIC_PASSWORD" ] || \
   [ -z "$SNAPSHOT_SQLITE3_DIRECTORY" ]; then
    echo "ERROR: One or more required environment variables are not set."
    echo "REQUIRED: BUCKET_REPOSITORY, BUCKET_SQLITE3_TAG, DATA_SQLITE3_FILE, RESTIC_PASSWORD, SNAPSHOT_SQLITE3_DIRECTORY"
    exit 1
fi

export RESTIC_PASSWORD="$RESTIC_PASSWORD"
export RESTIC_REPOSITORY="$BUCKET_REPOSITORY/$BUCKET_SQLITE3_TAG"

echo "Creating SQLite3 snapshot..."

mkdir -p "$SNAPSHOT_SQLITE3_DIRECTORY"
sqlite3 "file:${DATA_SQLITE3_FILE}?mode=ro" "VACUUM INTO '${SNAPSHOT_SQLITE3_DIRECTORY}/snapshot.db'"

echo "Creating restic snapshot for database..."

restic backup --tag $BUCKET_SQLITE3_TAG "$SNAPSHOT_SQLITE3_DIRECTORY"

echo "Pruning old database snapshots..."

restic forget \
    --tag $BUCKET_SQLITE3_TAG \
    --keep-daily 7 \
    --keep-weekly 5 \
    --keep-monthly 6 \
    --prune

echo "Cleaning up temporary snapshot file..."

rm -f "${SNAPSHOT_SQLITE3_DIRECTORY}/snapshot.db"

echo "Database backup and prune complete."