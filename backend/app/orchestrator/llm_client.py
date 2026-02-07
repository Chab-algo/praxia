import hashlib
import json
from dataclasses import dataclass

import structlog
import tiktoken
from openai import AsyncOpenAI

from app.config import settings

logger = structlog.get_logger()

# Pricing per 1M tokens (USD)
MODEL_PRICING = {
    "gpt-4.1-nano": {"input": 0.10, "output": 0.40},
    "gpt-4.1-mini": {"input": 0.40, "output": 1.60},
    "gpt-4.1": {"input": 2.00, "output": 8.00},
}


@dataclass
class LLMResponse:
    content: str
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    prompt_hash: str


class LLMClient:
    """Async OpenAI client with retry and cost tracking."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._encoder: tiktoken.Encoding | None = None

    @property
    def encoder(self) -> tiktoken.Encoding:
        if self._encoder is None:
            self._encoder = tiktoken.get_encoding("cl100k_base")
        return self._encoder

    def count_tokens(self, text: str) -> int:
        return len(self.encoder.encode(text))

    def count_messages_tokens(self, messages: list[dict]) -> int:
        total = 0
        for msg in messages:
            total += 4  # role/content overhead
            total += self.count_tokens(msg.get("content", ""))
        total += 2  # priming
        return total

    @staticmethod
    def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4.1-mini"])
        return (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

    @staticmethod
    def hash_prompt(model: str, messages: list[dict]) -> str:
        payload = json.dumps({"model": model, "messages": messages}, sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()

    async def complete(
        self,
        model: str,
        messages: list[dict],
        max_tokens: int = 500,
        temperature: float = 0.2,
        response_format: dict | None = None,
    ) -> LLMResponse:
        prompt_hash = self.hash_prompt(model, messages)

        logger.info(
            "llm_call_start",
            model=model,
            estimated_input_tokens=self.count_messages_tokens(messages),
            max_tokens=max_tokens,
        )

        kwargs: dict = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if response_format:
            kwargs["response_format"] = response_format

        response = await self.client.chat.completions.create(**kwargs)

        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        cost = self.calculate_cost(model, input_tokens, output_tokens)

        logger.info(
            "llm_call_complete",
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=f"${cost:.6f}",
        )

        return LLMResponse(
            content=response.choices[0].message.content or "",
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost,
            prompt_hash=prompt_hash,
        )


# Singleton
llm_client = LLMClient()
