"""
Script pour ingérer les corpus RAG (PraxIA + agents IA) avant démo.
Usage: uv run python -m scripts.ingest_rag

Ingère successivement backend/data/rag_sample.json et backend/data/rag_agents_ia.json.
Assure-toi que le backend est démarré et que la migration 008 est appliquée.
"""

import asyncio
import json
from pathlib import Path

import httpx

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
API_URL = "http://localhost:8000/rag/ingest"

FILES = ["rag_sample.json", "rag_agents_ia.json"]


async def main():
    async with httpx.AsyncClient(timeout=60.0) as client:
        total = 0
        for name in FILES:
            path = DATA_DIR / name
            if not path.exists():
                print(f"Skip {name} (not found)")
                continue
            data = json.loads(path.read_text(encoding="utf-8"))
            docs = data.get("documents", [])
            if not docs:
                print(f"Skip {name} (no documents)")
                continue
            payload = {"documents": [{"content": d["content"], "metadata": d.get("metadata", {})} for d in docs]}
            r = await client.post(API_URL, json=payload)
            r.raise_for_status()
            count = r.json().get("ingested", 0)
            total += count
            print(f"Ingested {name}: {count} documents")
    print(f"Total ingested: {total} documents")


if __name__ == "__main__":
    asyncio.run(main())
