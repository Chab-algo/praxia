FROM python:3.12-slim AS base

WORKDIR /app

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first (for caching)
COPY pyproject.toml uv.lock* ./

# Install dependencies only (cached layer)
RUN uv sync --frozen --no-dev --no-install-project

# Copy application code
COPY . .

# Install the project itself so 'app' is importable
RUN uv sync --frozen --no-dev

# Expose port
EXPOSE 8000

# Run with UV
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
