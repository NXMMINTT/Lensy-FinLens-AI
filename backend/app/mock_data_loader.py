import json
from functools import lru_cache
from pathlib import Path

MOCK_DATA_DIR = Path(__file__).resolve().parents[2] / "mock-data"


@lru_cache(maxsize=None)
def load_json(filename: str):
    path = MOCK_DATA_DIR / filename
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def product_entry(filename: str, product_id: str | None = None):
    """Pick one product's block from a per-product mock file (a list keyed by product_id); defaults to the first."""
    entries = load_json(filename)
    return next((e for e in entries if e["product_id"] == product_id), entries[0])


def competitor_entry(product_id: str | None = None, name: str | None = None):
    """Pick one product's block from competitor-prices.json by id or name (defaults to the first)."""
    if not product_id and name:
        entries = load_json("competitor-prices.json")
        product_id = next((e["product_id"] for e in entries if e["product_name"] == name), None)
    return product_entry("competitor-prices.json", product_id)
