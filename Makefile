.PHONY: dev dev-backend dev-frontend test lint migrate

# Start all services (Docker Compose)
dev:
	docker compose up --build

# Start backend only (local dev without Docker)
dev-backend:
	cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start frontend only (local dev without Docker)
dev-frontend:
	cd frontend && npm run dev

# Run backend tests
test:
	cd backend && uv run pytest -v

# Run linting
lint:
	cd backend && uv run ruff check . && uv run ruff format --check .

# Format code
format:
	cd backend && uv run ruff check --fix . && uv run ruff format .

# Run database migrations
migrate:
	cd backend && uv run alembic upgrade head

# Create a new migration
migration:
	cd backend && uv run alembic revision --autogenerate -m "$(msg)"

# Stop all Docker services
down:
	docker compose down

# Stop and remove volumes (fresh start)
clean:
	docker compose down -v
