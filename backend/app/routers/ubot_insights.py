"""Actionable insights + a suggested selling price for the Market Radar
overview (spec 2.2 Dynamic Pricing, 2.3 Actionable AI Insights).

The suggested price starts from a deterministic rule over mock competitor
prices; Gemini (via U-Fox's KKU client) explains it and may adjust it. If the
AI call fails or proposes something unsafe, the rule price and the static
insights.json are returned instead, so the demo page never breaks.
"""

import json
import logging
import re
import time
from statistics import median

from fastapi import APIRouter
from pydantic import BaseModel, Field, ValidationError

from app.core.ai_provider_settings import GEMINI_MODEL
from app.mock_data_loader import competitor_entry, load_json
from app.routers.ubot import SYSTEM_PROMPT, build_context, get_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ubot", tags=["ubot"])

MIN_MARGIN = 1.3  # never suggest selling below cost × 1.3
CACHE_SECONDS = 600
FALLBACK_CACHE_SECONDS = 60  # retry the AI soon after a failure, but not on every page load
_cache: dict[str, tuple[float, "InsightsOut"]] = {}  # product_id -> (expires_at, result)


class InsightsOut(BaseModel):
    product_id: str
    rule_price: int
    suggested_price: int
    reason: str
    insights: list[str]
    generated_by: str  # "gemini" | "rules"


class _AiAnswer(BaseModel):
    suggested_price: int
    reason: str = Field(min_length=1)
    insights: list[str] = Field(min_length=1, max_length=4)


def rule_price(product_id: str) -> int:
    """Median of in-stock Thai competitors, floored at cost × MIN_MARGIN."""
    data = competitor_entry(product_id=product_id)
    in_stock = [
        c["price"]
        for c in data["competitors"]
        if c["currency"] == "THB" and c["price"] is not None and c["stock"] == "มีสินค้า"
    ]
    target = median(in_stock) if in_stock else data["my_selling_price"]
    return round(max(target, data["my_cost_price"] * MIN_MARGIN))


def _fallback(product_id: str, price: int) -> InsightsOut:
    texts = [i["text"] for i in load_json("insights.json") if i["related_product_id"] == product_id]
    return InsightsOut(
        product_id=product_id,
        rule_price=price,
        suggested_price=price,
        reason="ตั้งที่ราคากลางของคู่แข่งไทยที่มีสินค้า และยังเหลือกำไรเกิน 30% ของต้นทุน",
        insights=texts,
        generated_by="rules",
    )


def _ask_gemini(product_id: str, price: int) -> InsightsOut:
    cost = competitor_entry(product_id=product_id)["my_cost_price"]
    prompt = (
        f"ราคาแนะนำจากกฎ (ค่ากลางคู่แข่งไทยที่มีของ) = {price} บาท, ต้นทุน = {cost} บาท\n"
        "วิเคราะห์ CONTEXT แล้วตอบเป็น JSON เท่านั้น: "
        '{"suggested_price": <จำนวนเต็มบาท>, "reason": "<เหตุผล 1 ประโยค>", '
        '"insights": ["<คำแนะนำสั้นที่ลงมือทำได้ทันที>", ... 3 ข้อ]} '
        "suggested_price ต้องห่างจากราคาแนะนำจากกฎไม่เกิน 15% และไม่ต่ำกว่าต้นทุน × 1.3"
    )
    completion = get_client().chat.completions.create(
        model=GEMINI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "system", "content": f"CONTEXT:\n{build_context(product_id)}"},
            {"role": "user", "content": prompt},
        ],
    )
    if not completion.choices:
        raise RuntimeError("KKU returned no choices")
    # KKU wraps JSON in ```json fences even in JSON mode.
    text = re.sub(r"^\s*```(?:json)?\s*|\s*```\s*$", "", completion.choices[0].message.content or "")
    answer = _AiAnswer.model_validate(json.loads(text))
    if not (cost * MIN_MARGIN <= answer.suggested_price and abs(answer.suggested_price - price) <= price * 0.15):
        raise ValueError(f"unsafe suggested price {answer.suggested_price} (rule {price})")
    return InsightsOut(
        product_id=product_id,
        rule_price=price,
        suggested_price=answer.suggested_price,
        reason=answer.reason,
        insights=answer.insights[:3],
        generated_by="gemini",
    )


@router.get("/insights", response_model=InsightsOut)
def get_insights(product_id: str = "P001", refresh: bool = False) -> InsightsOut:
    cached = _cache.get(product_id)
    if cached and not refresh and time.monotonic() < cached[0]:
        return cached[1]
    price = rule_price(product_id)
    try:
        result, ttl = _ask_gemini(product_id, price), CACHE_SECONDS
    except (Exception, ValidationError):  # noqa: BLE001 - any AI failure falls back to rules
        logger.warning("U-Fox insights fell back to rules", exc_info=True)
        result, ttl = _fallback(product_id, price), FALLBACK_CACHE_SECONDS
    _cache[product_id] = (time.monotonic() + ttl, result)
    return result
