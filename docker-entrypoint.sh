#!/bin/sh
set -e

echo "Running database migrations..."
npm run db:push:prod

echo "Starting application..."
exec node .output/server/index.mjs
