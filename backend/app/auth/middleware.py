import json
from typing import Annotated

import httpx
import jwt
import structlog
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.config import settings

logger = structlog.get_logger()

security = HTTPBearer()

# Lazy-initialized JWKS client (caches keys automatically)
_jwk_client: PyJWKClient | None = None


def _get_jwk_client() -> PyJWKClient:
    global _jwk_client
    if _jwk_client is None:
        jwks_url = f"https://{settings.clerk_domain}/.well-known/jwks.json"
        _jwk_client = PyJWKClient(jwks_url, cache_keys=True, lifespan=3600)
        logger.info("jwks_client_initialized", url=jwks_url)
    return _jwk_client


async def verify_clerk_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    """Verify Clerk JWT against JWKS and return decoded payload."""
    token = credentials.credentials

    # Dev mode: if no clerk domain configured, decode without verification
    if not settings.clerk_domain:
        logger.warning("clerk_domain_not_set", msg="Decoding JWT without verification (dev mode)")
        try:
            import base64

            parts = token.split(".")
            if len(parts) != 3:
                raise HTTPException(status_code=401, detail="Invalid token format")
            payload_b64 = parts[1]
            payload_b64 += "=" * (4 - len(payload_b64) % 4)
            return json.loads(base64.urlsafe_b64decode(payload_b64))
        except HTTPException:
            raise
        except Exception as e:
            logger.error("token_decode_failed", error=str(e))
            raise HTTPException(status_code=401, detail="Invalid token")

    # Production: full JWKS verification
    try:
        client = _get_jwk_client()
        signing_key = client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_exp": True,
                "verify_aud": False,  # Clerk doesn't always set audience
                "verify_iss": True,
            },
            issuer=f"https://{settings.clerk_domain}",
        )

        logger.debug("token_verified", sub=payload.get("sub"), org_id=payload.get("org_id"))
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidIssuerError:
        raise HTTPException(status_code=401, detail="Invalid token issuer")
    except jwt.PyJWKClientError as e:
        logger.error("jwks_fetch_failed", error=str(e))
        raise HTTPException(status_code=401, detail="Could not verify token")
    except jwt.InvalidTokenError as e:
        logger.error("token_invalid", error=str(e))
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        logger.error("token_verification_failed", error=str(e))
        raise HTTPException(status_code=401, detail="Authentication failed")
