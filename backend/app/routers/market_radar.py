from fastapi import APIRouter

from app.mock_data_loader import competitor_entry, load_json, product_entry

router = APIRouter(prefix="/api/market", tags=["market-radar"])


@router.get("/platforms")
def get_platforms():
    return load_json("platforms.json")


@router.get("/products")
def get_market_products():
    """Products that have market data, for the overview's product picker."""
    return [{"product_id": e["product_id"], "product_name": e["product_name"]} for e in load_json("competitor-prices.json")]


@router.get("/competitor-prices")
def get_competitor_prices(name: str | None = None, product_id: str | None = None):
    return competitor_entry(product_id=product_id, name=name)


@router.get("/trend")
def get_market_trend(product_id: str | None = None):
    return product_entry("market-trend.json", product_id)


@router.get("/keyword-volume")
def get_keyword_volume(product_id: str | None = None):
    keywords = load_json("keyword-volume.json")
    return [k for k in keywords if k["product_id"] == product_id] if product_id else keywords


@router.get("/eu-arbitrage")
def get_eu_arbitrage():
    return load_json("eu-arbitrage.json")


@router.get("/trend-catalog")
def get_trend_catalog():
    return load_json("trend-catalog.json")
