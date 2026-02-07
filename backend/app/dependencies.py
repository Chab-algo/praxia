from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.engine import get_db  # noqa: F401

# Re-export for convenience
__all__ = ["get_db"]
