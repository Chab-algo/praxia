import structlog
from redis.asyncio import Redis

from app.config import settings
from app.orchestrator.llm_client import MODEL_PRICING

logger = structlog.get_logger()

GLOBAL_BUDGET_KEY = "budget:global:spent"
ALERT_THRESHOLDS = [0.50, 0.75, 0.90, 0.95]


class BudgetExceededError(Exception):
    pass


class OrgBudgetExceededError(BudgetExceededError):
    pass


class GlobalBudgetExceededError(BudgetExceededError):
    pass


class BudgetMonitor:
    """Tracks and enforces OpenAI spending limits."""

    def __init__(self, redis: Redis):
        self.redis = redis
        self.max_budget = settings.openai_budget_limit

    def estimate_cost(self, model: str, input_tokens: int, max_output_tokens: int) -> float:
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4.1-mini"])
        return (input_tokens * pricing["input"] + max_output_tokens * pricing["output"]) / 1_000_000

    def actual_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4.1-mini"])
        return (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

    async def get_global_spent(self) -> float:
        spent = await self.redis.get(GLOBAL_BUDGET_KEY)
        return float(spent) if spent else 0.0

    async def check_and_reserve(self, estimated_cost: float) -> None:
        """Check global budget and reserve estimated cost. Raises if exceeded."""
        current = await self.get_global_spent()

        if current + estimated_cost > self.max_budget:
            logger.error(
                "global_budget_exceeded",
                current_spent=current,
                estimated_cost=estimated_cost,
                max_budget=self.max_budget,
            )
            raise GlobalBudgetExceededError(
                f"Global budget exceeded: ${current:.4f} spent + ${estimated_cost:.4f} estimated "
                f"> ${self.max_budget:.2f} limit"
            )

        # Reserve
        new_total = await self.redis.incrbyfloat(GLOBAL_BUDGET_KEY, estimated_cost)

        # Check alert thresholds
        ratio = new_total / self.max_budget
        for threshold in ALERT_THRESHOLDS:
            prev_ratio = (new_total - estimated_cost) / self.max_budget
            if prev_ratio < threshold <= ratio:
                logger.warning(
                    "budget_threshold_crossed",
                    threshold=f"{threshold:.0%}",
                    spent=f"${new_total:.4f}",
                    budget=f"${self.max_budget:.2f}",
                )

    async def record_actual(self, estimated_cost: float, actual_cost: float) -> None:
        """Correct the difference between estimated and actual cost."""
        diff = actual_cost - estimated_cost
        if abs(diff) > 0.000001:
            await self.redis.incrbyfloat(GLOBAL_BUDGET_KEY, diff)

    async def get_budget_status(self) -> dict:
        spent = await self.get_global_spent()
        return {
            "spent_usd": round(spent, 6),
            "budget_usd": self.max_budget,
            "remaining_usd": round(self.max_budget - spent, 6),
            "usage_percent": round((spent / self.max_budget) * 100, 1) if self.max_budget else 0,
        }
