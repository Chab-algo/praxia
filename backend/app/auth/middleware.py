import json
from typing import Annotated

import httpx
import structlog
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

logger = structlog.get_logger()

security = HTTPBearer()


# Cache JWKS keys in memory
_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    jwks_url = f"https://{settings.clerk_domain}/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        resp = await client.get(jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        return _jwks_cache


async def verify_clerk_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    """Verify Clerk JWT and return decoded payload.

    For MVP, we do a simple decode. In production, use jose/jwcrypto
    to verify against JWKS.
    """
    token = credentials.credentials

    try:
        # Decode JWT payload (middle part) without full verification for dev
        # TODO: Add proper JWKS verification with python-jose for production
        import base64

        parts = token.split(".")
        if len(parts) != 3:
            raise HTTPException(status_code=401, detail="Invalid token format")

        # Decode payload
        payload_b64 = parts[1]
        # Add padding
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))

        return payload
    except HTTPException:
        raise
    except Exception as e:
        logger.error("token_verification_failed", error=str(e))
        raise HTTPException(status_code=401, detail="Invalid authentication token")
