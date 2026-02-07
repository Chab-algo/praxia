import base64
import structlog
from typing import Optional

from app.orchestrator.llm_client import get_llm_client

logger = structlog.get_logger()

# Vision models pricing (per 1M tokens)
VISION_MODEL_PRICING = {
    "gpt-4o": {"input": 2.50, "output": 10.00},  # GPT-4o with vision
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},  # GPT-4o-mini with vision
}


def is_base64_image(data: str) -> bool:
    """Vérifie si une chaîne est une image base64 valide."""
    try:
        if not data.startswith("data:image/"):
            # Try to decode as base64
            base64.b64decode(data)
            return True
        # data:image/jpeg;base64,...
        parts = data.split(",")
        if len(parts) == 2:
            base64.b64decode(parts[1])
            return True
        return False
    except Exception:
        return False


def prepare_image_content(image_data: str) -> dict:
    """
    Prépare le contenu d'une image pour l'API OpenAI Vision.

    Args:
        image_data: Image en base64 ou data URL

    Returns:
        dict: Contenu formaté pour l'API
    """
    # Handle data URL format: data:image/jpeg;base64,...
    if image_data.startswith("data:image/"):
        parts = image_data.split(",")
        if len(parts) == 2:
            image_data = parts[1]

    return {
        "type": "image_url",
        "image_url": {
            "url": f"data:image/jpeg;base64,{image_data}" if not image_data.startswith("data:") else image_data
        },
    }


async def analyze_image(
    image_data: str,
    prompt: str,
    model: str = "gpt-4o-mini",
    max_tokens: int = 500,
) -> dict:
    """
    Analyse une image avec un modèle vision.

    Args:
        image_data: Image en base64
        prompt: Prompt pour l'analyse
        model: Modèle à utiliser (gpt-4o ou gpt-4o-mini)
        max_tokens: Nombre maximum de tokens

    Returns:
        dict: Résultat de l'analyse
    """
    client = get_llm_client()

    # Prepare messages with image
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                prepare_image_content(image_data),
            ],
        }
    ]

    logger.info("vision_call_start", model=model, prompt_length=len(prompt))

    try:
        # Use vision-capable model
        response = await client.client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
        )

        content = response.choices[0].message.content or ""
        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens

        # Calculate cost for vision models
        pricing = VISION_MODEL_PRICING.get(model, VISION_MODEL_PRICING["gpt-4o-mini"])
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

        logger.info(
            "vision_call_complete",
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=f"${cost:.6f}",
        )

        return {
            "content": content,
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost,
        }
    except Exception as e:
        logger.error("vision_call_failed", error=str(e))
        raise
