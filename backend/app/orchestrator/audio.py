import base64
import structlog
from typing import Optional

from app.orchestrator.llm_client import get_llm_client

logger = structlog.get_logger()


def is_audio_data(data: str) -> bool:
    """Vérifie si une chaîne contient des données audio."""
    if not isinstance(data, str):
        return False
    try:
        if data.startswith("data:audio/"):
            return True
        # Try to decode as base64 (basic check)
        if len(data) > 100:
            try:
                base64.b64decode(data[:100])
                return True
            except Exception:
                return False
        return False
    except Exception:
        return False


async def transcribe_audio(
    audio_data: str,
    language: Optional[str] = None,
) -> dict:
    """
    Transcrit un fichier audio en texte.

    Args:
        audio_data: Audio en base64 ou data URL
        language: Code langue (fr, en, etc.) - optionnel

    Returns:
        dict: Transcription avec texte et métadonnées
    """
    client = get_llm_client()

    # Handle data URL format: data:audio/mpeg;base64,...
    if audio_data.startswith("data:audio/"):
        parts = audio_data.split(",")
        if len(parts) == 2:
            audio_data = parts[1]

    # Decode base64 to bytes
    try:
        audio_bytes = base64.b64decode(audio_data)
    except Exception as e:
        logger.error("audio_decode_failed", error=str(e))
        raise ValueError("Invalid audio data format")

    logger.info("audio_transcription_start", language=language, size_bytes=len(audio_bytes))

    try:
        # Use OpenAI Whisper API
        transcription = await client.client.audio.transcriptions.create(
            model="whisper-1",
            file=("audio.mp3", audio_bytes, "audio/mpeg"),
            language=language,
        )

        text = transcription.text

        logger.info(
            "audio_transcription_complete",
            text_length=len(text),
            language=language,
        )

        return {
            "text": text,
            "language": language or "auto",
        }
    except Exception as e:
        logger.error("audio_transcription_failed", error=str(e))
        raise ValueError(f"Erreur lors de la transcription: {str(e)}")
