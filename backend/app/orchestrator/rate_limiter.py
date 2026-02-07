import time

import structlog
from redis.asyncio import Redis

logger = structlog.get_logger()

# Default rate limits per plan (requests per day)
PLAN_RATE_LIMITS = {
    "trial": {"daily": 50, "per_minute": 5},
    "starter": {"daily": 500, "per_minute": 20},
    "pro": {"daily": 5000, "per_minute": 50},
    "enterprise": {"daily": 50000, "per_minute": 200},
}


class RateLimitExceededError(Exception):
    pass


class RateLimiter:
    """Redis sliding window rate limiter per organization."""

    def __init__(self, redis: Redis):
        self.redis = redis

    async def check(self, org_id: str, plan: str = "trial") -> None:
        limits = PLAN_RATE_LIMITS.get(plan, PLAN_RATE_LIMITS["trial"])
        now = time.time()

        # Check per-minute limit (sliding window)
        minute_key = f"rl:{org_id}:minute"
        await self.redis.zremrangebyscore(minute_key, 0, now - 60)
        minute_count = await self.redis.zcard(minute_key)

        if minute_count >= limits["per_minute"]:
            raise RateLimitExceededError(
                f"Rate limit exceeded: {minute_count}/{limits['per_minute']} requests per minute"
            )

        # Check daily limit
        day_key = f"rl:{org_id}:day:{int(now // 86400)}"
        day_count = await self.redis.get(day_key)
        day_count = int(day_count) if day_count else 0

        if day_count >= limits["daily"]:
            raise RateLimitExceededError(
                f"Daily limit exceeded: {day_count}/{limits['daily']} requests per day"
            )

        # Record this request
        await self.redis.zadd(minute_key, {str(now): now})
        await self.redis.expire(minute_key, 120)  # cleanup after 2 min

        await self.redis.incr(day_key)
        await self.redis.expire(day_key, 86400)
