import time

from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel

from app.core.ai_provider_settings import GEMINI_API_KEY, GEMINI_BASE_URL, GEMINI_MODEL
from app.mock_data_loader import competitor_entry, load_json

router = APIRouter(prefix="/api/ubot", tags=["ubot"])

SYSTEM_PROMPT = """คุณคือ U-Fox ผู้ช่วย AI นักวิเคราะห์การตลาดของแอป U-Ledger AI
สำหรับพ่อค้าแม่ค้าออนไลน์ SME ไทย ตอบคำถามเรื่องกำไร รายรับรายจ่าย ภาษี
และกลยุทธ์ตั้งราคาแข่งกับคู่แข่งบนแพลตฟอร์มต่างๆ โดยใช้ข้อมูลใน CONTEXT ที่ให้มาเท่านั้น
ตอบเป็นภาษาไทย กระชับ ไม่เกิน 3-4 ประโยค เน้นคำแนะนำที่ลงมือทำได้ทันที (actionable)
ถ้าถามเรื่องภาษี ให้บอกว่าตัวเลขเป็นการประมาณเบื้องต้น ควรตรวจกับผู้สอบบัญชีก่อนยื่นจริง"""

# Keep answers short and stop the model from running up output tokens.
MAX_ANSWER_TOKENS = 400
MAX_QUESTION_CHARS = 500
# Repeated questions reuse the cached answer instead of calling Gemini again.
CACHE_SECONDS = 600
_cache: dict[tuple[str, str], tuple[float, str]] = {}


class AskRequest(BaseModel):
    question: str
    product_id: str | None = None


class AskResponse(BaseModel):
    answer: str


def build_context(product_id: str | None) -> str:
    """A compact context: only the essentials, so each call stays cheap on tokens."""
    products = load_json("products.json")
    tax = load_json("tax-status.json")
    competitor_prices = competitor_entry(product_id=product_id)
    keywords = load_json("keyword-volume.json")
    keywords = [k for k in keywords if k["product_id"] == product_id] or keywords

    product = next((p for p in products if p["product_id"] == product_id), None) if product_id else None

    product_list = ", ".join(f"{p.get('name')} (ขาย {p.get('my_selling_price', '-')}฿)" for p in products)
    # Thai, in-stock competitors only, cheapest first, capped — that's what pricing advice needs.
    comps = [c for c in competitor_prices["competitors"] if c.get("currency") == "THB" and c.get("price")]
    comps.sort(key=lambda c: c["price"])
    comp_list = ", ".join(f"{c['platform']} {c['seller']} {c['price']}฿" for c in comps[:6])
    top_keywords = ", ".join(
        f"{k['keyword']} ({k['search_volume']})"
        for k in sorted(keywords, key=lambda k: k["search_volume"], reverse=True)[:5]
    )

    parts = [
        f"สถานะภาษี: ยอดขายสะสม {tax['cumulative_revenue']} บาท "
        f"({tax['percent_of_threshold']}% ของเพดาน VAT {tax['vat_threshold']} บาท) "
        f"ระดับความเสี่ยง {tax['risk_level']}",
        f"รายการสินค้า: {product_list}",
        f"ราคาคู่แข่งไทยของ {competitor_prices['product_name']} (ถูกสุดก่อน): {comp_list} "
        f"| ต้นทุนเรา {competitor_prices['my_cost_price']}฿ ขายเรา {competitor_prices['my_selling_price']}฿",
        f"คำค้นยอดฮิต: {top_keywords}",
    ]
    if product:
        parts.insert(1, f"สินค้าที่กำลังคุยถึง: {product}")

    return "\n".join(parts)


def get_client() -> OpenAI:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="KKU_API_KEY ยังไม่ได้ตั้งค่า — เพิ่มใน backend/.env ก่อนใช้งาน U-Fox",
        )
    return OpenAI(base_url=GEMINI_BASE_URL, api_key=GEMINI_API_KEY)


@router.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="กรุณาพิมพ์คำถามครับ")
    if len(question) > MAX_QUESTION_CHARS:
        raise HTTPException(status_code=400, detail=f"คำถามยาวเกินไป (จำกัด {MAX_QUESTION_CHARS} ตัวอักษร)")

    cache_key = (req.product_id or "", question.lower())
    cached = _cache.get(cache_key)
    if cached and time.monotonic() < cached[0]:
        return AskResponse(answer=cached[1])

    client = get_client()
    context = build_context(req.product_id)

    try:
        completion = client.chat.completions.create(
            model=GEMINI_MODEL,
            max_tokens=MAX_ANSWER_TOKENS,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "system", "content": f"CONTEXT:\n{context}"},
                {"role": "user", "content": question},
            ],
        )
    except Exception as exc:  # noqa: BLE001 - surface upstream error to caller
        raise HTTPException(status_code=502, detail=f"เรียก Gemini ไม่สำเร็จ: {exc}") from exc

    answer = (completion.choices[0].message.content or "").strip()
    if answer:
        _cache[cache_key] = (time.monotonic() + CACHE_SECONDS, answer)
    return AskResponse(answer=answer)
