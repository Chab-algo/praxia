from typing import Annotated

import structlog
from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware import verify_clerk_token
from app.auth.models import User
from app.db.engine import get_db

logger = structlog.get_logger()


async def get_current_user(
    payload: Annotated[dict, Depends(verify_clerk_token)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Get or create user from Clerk JWT payload."""
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing sub")

    user = await db.scalar(select(User).where(User.clerk_user_id == clerk_user_id))

    if not user:
        # Auto-create user on first API call (webhook may not have fired yet)
        user = User(
            clerk_user_id=clerk_user_id,
            email=payload.get("email", f"{clerk_user_id}@clerk.dev"),
            full_name=payload.get("name"),
        )
        db.add(user)
        await db.flush()
        logger.info("user_auto_created", clerk_user_id=clerk_user_id)

    return user
