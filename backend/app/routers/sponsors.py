from typing import Optional

from fastapi import APIRouter, HTTPException

from app.mock_data_loader import load_json

router = APIRouter(prefix="/api/b2b", tags=["b2b"])

# In-memory click overlay for the demo — keeps mock-data/*.json untouched.
_click_overrides: dict[str, int] = {}


def _with_live_clicks(listing: dict) -> dict:
    listing = dict(listing)
    listing["clicks"] = listing["clicks"] + _click_overrides.get(listing["listing_id"], 0)
    return listing


@router.get("/sponsors")
def get_sponsors():
    listings = load_json("b2b-sponsors.json")
    return [_with_live_clicks(l) for l in listings]


@router.get("/sponsors/match")
def match_sponsors(product_id: Optional[str] = None, keyword: Optional[str] = None):
    listings = load_json("b2b-sponsors.json")

    def is_match(listing: dict) -> bool:
        if product_id and product_id in listing["target_product_ids"]:
            return True
        if keyword and keyword in listing["target_keywords"]:
            return True
        return False

    matched = [l for l in listings if is_match(l)] if (product_id or keyword) else listings
    matched.sort(key=lambda l: l["sponsored_rank"])
    return [_with_live_clicks(l) for l in matched]


@router.get("/sponsors/{listing_id}")
def get_sponsor(listing_id: str):
    listing = next((l for l in load_json("b2b-sponsors.json") if l["listing_id"] == listing_id), None)
    if listing is None:
        raise HTTPException(status_code=404, detail="Sponsored listing not found")
    return _with_live_clicks(listing)


@router.post("/sponsors/{listing_id}/click")
def record_click(listing_id: str):
    listings = load_json("b2b-sponsors.json")
    if not any(l["listing_id"] == listing_id for l in listings):
        raise HTTPException(status_code=404, detail="Sponsored listing not found")

    _click_overrides[listing_id] = _click_overrides.get(listing_id, 0) + 1
    base = next(l for l in listings if l["listing_id"] == listing_id)
    return _with_live_clicks(base)
