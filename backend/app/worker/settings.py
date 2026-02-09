from arq.connections import RedisSettings

from app.config import settings


def parse_redis_url(url: str) -> RedisSettings:
    """Parse a Redis URL into ARQ RedisSettings."""
    # Supports: redis://host:port/db OR redis://user:password@host:port/db
    from urllib.parse import urlparse

    parsed = urlparse(url)

    host = parsed.hostname or "localhost"
    port = parsed.port or 6379
    database = int(parsed.path.lstrip("/")) if parsed.path and parsed.path != "/" else 0
    password = parsed.password

    return RedisSettings(
        host=host,
        port=port,
        database=database,
        password=password,
    )


class WorkerSettings:
    redis_settings = parse_redis_url(settings.redis_url)
    functions = [
        "app.worker.tasks.execute_agent_task",
        "app.worker.tasks.process_batch_item_task",
    ]
    max_jobs = 10
    job_timeout = 300  # 5 minutes max per job
    max_tries = 3
    retry_after = 60  # seconds before retry
