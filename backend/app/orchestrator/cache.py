import hashlib
import json
from dataclasses import dataclass

import structlog
from redis.asyncio import Redis

logger = structlog.get_logger()


@dataclass
class CacheResult:
    hit: bool
    layer: str = ""  # "exact" or "template"
    data: dict | None = None


class LLMCache:
    """Redis cache with 2 layers: exact match and template match."""

    EXACT_TTL = 86400  # 24 hours
    TEMPLATE_TTL = 43200  # 12 hours

    def __init__(self, redis: Redis):
        self.redis = redis

    @staticmethod
    def _exact_key(model: str, messages: list[dict]) -> str:
        payload = json.dumps({"model": model, "messages": messages}, sort_keys=True)
        return f"llm:exact:{hashlib.sha256(payload.encode()).hexdigest()}"

    @staticmethod
    def _template_key(recipe_id: str, step_id: str, normalized_input: str) -> str:
        payload = f"{recipe_id}:{step_id}:{normalized_input.lower().strip()}"
        return f"llm:tpl:{hashlib.sha256(payload.encode()).hexdigest()}"

    async def get(
        self,
        model: str,
        messages: list[dict],
        recipe_id: str | None = None,
        step_id: str | None = None,
        input_text: str | None = None,
    ) -> CacheResult:
        # Layer 1: exact match
        key1 = self._exact_key(model, messages)
        cached = await self.redis.get(key1)
        if cached:
            logger.debug("cache_hit", layer="exact")
            return CacheResult(hit=True, layer="exact", data=json.loads(cached))

        # Layer 2: template match
        if recipe_id and step_id and input_text:
            key2 = self._template_key(recipe_id, step_id, input_text)
            cached = await self.redis.get(key2)
            if cached:
                logger.debug("cache_hit", layer="template")
                return CacheResult(hit=True, layer="template", data=json.loads(cached))

        return CacheResult(hit=False)

    async def set(
        self,
        model: str,
        messages: list[dict],
        response_data: dict,
        recipe_id: str | None = None,
        step_id: str | None = None,
        input_text: str | None = None,
    ) -> None:
        data = json.dumps(response_data)

        # Layer 1: exact match
        key1 = self._exact_key(model, messages)
        await self.redis.setex(key1, self.EXACT_TTL, data)

        # Layer 2: template match
        if recipe_id and step_id and input_text:
            key2 = self._template_key(recipe_id, step_id, input_text)
            await self.redis.setex(key2, self.TEMPLATE_TTL, data)
