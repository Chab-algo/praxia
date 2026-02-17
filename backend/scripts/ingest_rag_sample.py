"""
Script pour ingérer la data sample RAG (avant démo).
Usage: uv run python -m scripts.ingest_rag_sample

Assure-toi que BACKEND est démarré et que la migration 008 est appliquée.
Utilise l'API locale: POST http://localhost:8000/rag/ingest
"""

import asyncio
import json
from pathlib import Path

import httpx

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "rag_sample.json"
API_URL = "http://localhost:8000/rag/ingest"


async def main():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(API_URL, json=data)
        r.raise_for_status()
    print("Ingested:", r.json().get("ingested", 0), "documents")


if __name__ == "__main__":
    asyncio.run(main())
