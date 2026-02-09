import asyncio

import httpx
import structlog

logger = structlog.get_logger()


async def send_webhook(
    webhook_url: str,
    payload: dict,
    max_retries: int = 3,
) -> bool:
    """
    POST payload to webhook_url with exponential backoff retry.

    Retries: 1s, 4s, 16s
    Timeout: 10s per request
    Returns True if successful, False if all retries fail.
    """
    backoff = 1
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(webhook_url, json=payload)
                if response.status_code < 400:
                    logger.info(
                        "webhook_sent",
                        url=webhook_url,
                        status=response.status_code,
                        attempt=attempt + 1,
                    )
                    return True
                logger.warning(
                    "webhook_bad_status",
                    url=webhook_url,
                    status=response.status_code,
                    attempt=attempt + 1,
                )
        except Exception as e:
            logger.warning(
                "webhook_error",
                url=webhook_url,
                error=str(e),
                attempt=attempt + 1,
            )

        if attempt < max_retries - 1:
            await asyncio.sleep(backoff)
            backoff *= 4

    logger.error(
        "webhook_failed_all_retries",
        url=webhook_url,
        max_retries=max_retries,
    )
    return False
