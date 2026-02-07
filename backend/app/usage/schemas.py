from pydantic import BaseModel


class BudgetStatusResponse(BaseModel):
    spent_usd: float
    budget_usd: float
    remaining_usd: float
    usage_percent: float
