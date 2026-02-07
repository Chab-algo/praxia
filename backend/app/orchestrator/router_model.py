import structlog

logger = structlog.get_logger()

# Step complexity -> default model mapping
COMPLEXITY_MODEL_MAP = {
    "classify": "gpt-4.1-nano",
    "extract": "gpt-4.1-nano",
    "score": "gpt-4.1-nano",
    "validate": "gpt-4.1-nano",
    "generate_short": "gpt-4.1-mini",
    "generate_long": "gpt-4.1-mini",
    "analyze": "gpt-4.1-mini",
    "summarize": "gpt-4.1-mini",
    "reason": "gpt-4.1",
    "decide_complex": "gpt-4.1",
}

# Plan-based restrictions
PLAN_MODEL_LIMITS = {
    "trial": {"gpt-4.1-nano"},
    "starter": {"gpt-4.1-nano", "gpt-4.1-mini"},
    "pro": {"gpt-4.1-nano", "gpt-4.1-mini", "gpt-4.1"},
    "enterprise": {"gpt-4.1-nano", "gpt-4.1-mini", "gpt-4.1"},
}


class ModelRouter:
    """Selects the optimal model based on task complexity and org plan."""

    def select(
        self,
        complexity: str,
        org_plan: str = "trial",
        input_tokens: int = 0,
        force_model: str | None = None,
    ) -> str:
        if force_model:
            return force_model

        # Base model from complexity
        base_model = COMPLEXITY_MODEL_MAP.get(complexity, "gpt-4.1-mini")

        # Downgrade for long inputs (cost optimization)
        if input_tokens > 4000 and base_model == "gpt-4.1":
            base_model = "gpt-4.1-mini"

        # Enforce plan limits
        allowed = PLAN_MODEL_LIMITS.get(org_plan, PLAN_MODEL_LIMITS["trial"])
        if base_model not in allowed:
            # Downgrade to best available
            for fallback in ["gpt-4.1-mini", "gpt-4.1-nano"]:
                if fallback in allowed:
                    logger.info(
                        "model_downgraded",
                        original=base_model,
                        downgraded_to=fallback,
                        reason="plan_limit",
                    )
                    base_model = fallback
                    break

        return base_model


# Singleton
model_router = ModelRouter()
