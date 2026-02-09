from arq.connections import RedisSettings

from app.config import settings


def parse_redis_url(url: str) -> RedisSettings:
    """Parse a Redis URL into ARQ RedisSettings."""
    # redis://host:port/db
    url = url.replace("redis://", "")
    parts = url.split("/")
    host_port = parts[0]
    database = int(parts[1]) if len(parts) > 1 else 0

    if ":" in host_port:
        host, port = host_port.split(":")
        port = int(port)
    else:
        host = host_port
        port = 6379

    return RedisSettings(host=host, port=port, database=database)


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
