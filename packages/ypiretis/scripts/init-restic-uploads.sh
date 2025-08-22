#!/usr/bin/env sh

set -e

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || \
   [ -z "$BUCKET_REPOSITORY" ] || [ -z "$BUCKET_UPLOADS_TAG" ] || \
   [ -z "$RESTIC_PASSWORD" ]; then
    echo "ERROR: One or more required environment variables are not set."
    echo "REQUIRED: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_REPOSITORY, BUCKET_UPLOADS_TAG, RESTIC_PASSWORD"
    exit 1
fi

export RESTIC_PASSWORD="$RESTIC_PASSWORD"
export RESTIC_REPOSITORY="$BUCKET_REPOSITORY/$BUCKET_UPLOADS_TAG"

echo "Initializing restic repository for uploads at: $RESTIC_REPOSITORY"

restic init

echo "Uploads repository initialized successfully."