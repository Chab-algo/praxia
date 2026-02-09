from typing import Annotated, Optional

import structlog
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware import verify_clerk_token
from app.auth.models import User
from app.db.engine import get_db
from app.organizations.models import Organization

logger = structlog.get_logger()

# Security scheme for optional authentication
security = HTTPBearer(auto_error=False)


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


async def get_current_org(
    payload: Annotated[dict, Depends(verify_clerk_token)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Optional[Organization]:
    """
    DEPRECATED: Organization-based multi-tenancy has been removed (Feb 2026).
    All resources are now scoped by user_id only.
    This function is kept for backwards compatibility but always returns None.
    """
    return None


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None."""
    if not credentials:
        return None
    
    if not db:
        return None
    
    try:
        payload = await verify_clerk_token(credentials)
        clerk_user_id = payload.get("sub")
        if not clerk_user_id:
            return None

        user = await db.scalar(select(User).where(User.clerk_user_id == clerk_user_id))
        return user
    except HTTPException:
        return None
    except Exception as e:
        logger.debug("optional_auth_failed", error=str(e))
        return None
