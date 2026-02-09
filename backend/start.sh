#!/bin/sh
set -e

# Run migrations
PYTHONPATH=/app uv run alembic upgrade head

# Start ARQ worker in background with trap for clean shutdown
PYTHONPATH=/app uv run arq app.worker.settings.WorkerSettings &
ARQ_PID=$!
trap "kill $ARQ_PID 2>/dev/null; wait $ARQ_PID 2>/dev/null" EXIT INT TERM

# Start web server (foreground)
PYTHONPATH=/app uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
