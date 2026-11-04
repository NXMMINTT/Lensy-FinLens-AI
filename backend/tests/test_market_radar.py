from fastapi.testclient import TestClient

from app.main import app
from app.mock_data_loader import load_json

client = TestClient(app)


def _product_ids() -> list[str]:
    return [p["product_id"] for p in client.get("/api/market/products").json()]


def test_products_lists_every_product_with_competitor_data():
    products = client.get("/api/market/products").json()
    assert products[0] == {"product_id": "P001", "product_name": "น้ำพริกเผา"}
    assert len(products) == len(load_json("competitor-prices.json"))


def test_competitor_prices_pick_by_id_or_name_and_default_to_first():
    assert client.get("/api/market/competitor-prices", params={"product_id": "P002"}).json()["product_name"] == "ชาไทยผง"
    assert client.get("/api/market/competitor-prices", params={"name": "กล้วยตาก"}).json()["product_id"] == "P004"
    assert client.get("/api/market/competitor-prices").json()["product_id"] == "P001"
    assert client.get("/api/market/competitor-prices", params={"product_id": "NOPE"}).json()["product_id"] == "P001"


def test_trend_is_per_product():
    assert client.get("/api/market/trend", params={"product_id": "P003"}).json()["product_name"] == "ผ้าขาวม้าทอมือ"
    assert client.get("/api/market/trend").json()["product_id"] == "P001"


def test_keyword_volume_filters_by_product():
    keywords = client.get("/api/market/keyword-volume", params={"product_id": "P005"}).json()
    assert keywords and all(k["product_id"] == "P005" for k in keywords)
    assert len(client.get("/api/market/keyword-volume").json()) == len(load_json("keyword-volume.json"))


def test_every_market_product_has_trend_keywords_and_eu_data():
    trend_ids = {t["product_id"] for t in load_json("market-trend.json")}
    keyword_ids = {k["product_id"] for k in load_json("keyword-volume.json")}
    eu_ids = {e["product_id"] for e in load_json("eu-arbitrage.json")}
    for product_id in _product_ids():
        assert product_id in trend_ids
        assert product_id in keyword_ids
        assert product_id in eu_ids


def test_sponsor_detail_by_id_and_404_for_unknown():
    assert client.get("/api/b2b/sponsors/B2B006").json()["sponsor_name"] == "ไร่ชาดอยแม่สลอง"
    assert client.get("/api/b2b/sponsors/match", params={"product_id": "P004"}).status_code == 200
    assert client.get("/api/b2b/sponsors/NOPE").status_code == 404


def test_sponsors_only_target_known_products():
    known = set(_product_ids())
    for listing in load_json("b2b-sponsors.json"):
        assert set(listing["target_product_ids"]) <= known
