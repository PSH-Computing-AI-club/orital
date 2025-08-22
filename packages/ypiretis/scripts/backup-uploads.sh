#!/usr/bin/env sh

set -e

if [ -z "$BUCKET_REPOSITORY" ] || [ -z "$BUCKET_UPLOADS_TAG" ] || \
   [ -z "$DATA_UPLOADS_DIRECTORY" ] || [ -z "$RESTIC_PASSWORD" ]; then
    echo "ERROR: One or more required environment variables are not set."
    echo "REQUIRED: BUCKET_REPOSITORY, BUCKET_UPLOADS_TAG, DATA_UPLOADS_DIRECTORY, RESTIC_PASSWORD"
    exit 1
fi

export RESTIC_PASSWORD="$RESTIC_PASSWORD"
export RESTIC_REPOSITORY="$BUCKET_REPOSITORY/$BUCKET_UPLOADS_TAG"

echo "Creating restic snapshot for uploads..."

restic backup --tag $BUCKET_UPLOADS_TAG "$DATA_UPLOADS_DIRECTORY"

echo "Pruning old uploads snapshots..."

restic forget \
    --tag $BUCKET_UPLOADS_TAG \
    --keep-daily 7 \
    --keep-weekly 5 \
    --keep-monthly 6 \
    --prune

echo "Uploads backup and prune complete."