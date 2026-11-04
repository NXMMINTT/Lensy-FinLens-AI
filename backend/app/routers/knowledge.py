import base64
import time
from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.mock_data_loader import load_json
from app.routers.ubot import get_client
from app.routers.voice import _synthesize
from app.core.ai_provider_settings import GEMINI_MODEL

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

MAX_SCRIPT_TOKENS = 320
# A topic's script is the same all day, so cache it and avoid repeat Gemini calls.
SCRIPT_CACHE_SECONDS = 6 * 60 * 60
_script_cache: dict[str, tuple[float, str]] = {}

SCRIPT_SYSTEM_PROMPT = """คุณคือผู้ประกาศข่าวธุรกิจสั้นประจำวันของแอป U-Ledger AI
สำหรับพ่อค้าแม่ค้าออนไลน์ SME ไทย เขียนสคริปต์พูดความยาวประมาณ 45-60 วินาที (ราว 120-150 คำ)
จากหัวข้อและประเด็นที่ให้มา น้ำเสียงเป็นกันเอง ให้ความรู้ชัดเจน ไม่โฆษณาเกินจริง
ขึ้นต้นด้วยการทักทายสั้นๆ แล้วเข้าเรื่องเลย จบด้วยคำแนะนำที่ลงมือทำได้ทันที 1 ข้อ
ตอบเฉพาะสคริปต์ที่จะพูด ไม่ต้องมีหัวข้อหรือวงเล็บกำกับ"""


class TopicAudioResponse(BaseModel):
    topic_id: str
    title: str
    category: str
    script: str
    audio_base64: str
    audio_mime: str = "audio/mpeg"


def _find_topic(topic_id: str) -> dict:
    topics = load_json("daily-knowledge.json")
    topic = next((t for t in topics if t["topic_id"] == topic_id), None)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


def _todays_topic() -> dict:
    topics = load_json("daily-knowledge.json")
    idx = date.today().toordinal() % len(topics)
    return topics[idx]


def _generate_script(topic: dict) -> str:
    cached = _script_cache.get(topic["topic_id"])
    if cached and time.monotonic() < cached[0]:
        return cached[1]

    client = get_client()
    outline = "\n".join(f"- {point}" for point in topic["outline"])
    user_prompt = f"หัวข้อ: {topic['title']}\nหมวด: {topic['category']}\nประเด็นที่ต้องพูดถึง:\n{outline}"

    try:
        completion = client.chat.completions.create(
            model=GEMINI_MODEL,
            max_tokens=MAX_SCRIPT_TOKENS,
            messages=[
                {"role": "system", "content": SCRIPT_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
    except Exception as exc:  # noqa: BLE001 - surface upstream error to caller
        raise HTTPException(status_code=502, detail=f"เรียก Gemini ไม่สำเร็จ: {exc}") from exc

    script = (completion.choices[0].message.content or "").strip()
    if script:
        _script_cache[topic["topic_id"]] = (time.monotonic() + SCRIPT_CACHE_SECONDS, script)
    return script


@router.get("/topics")
def list_topics():
    return load_json("daily-knowledge.json")


@router.get("/daily")
def daily_script():
    topic = _todays_topic()
    script = _generate_script(topic)
    return {**topic, "script": script}


@router.get("/daily/audio", response_model=TopicAudioResponse)
def daily_audio():
    topic = _todays_topic()
    script = _generate_script(topic)
    audio = _synthesize(script)
    return TopicAudioResponse(
        topic_id=topic["topic_id"],
        title=topic["title"],
        category=topic["category"],
        script=script,
        audio_base64=base64.b64encode(audio).decode("ascii"),
    )


@router.get("/topics/{topic_id}/script")
def topic_script(topic_id: str):
    topic = _find_topic(topic_id)
    return {**topic, "script": _generate_script(topic)}


@router.get("/topics/{topic_id}/audio", response_model=TopicAudioResponse)
def topic_audio(topic_id: str):
    topic = _find_topic(topic_id)
    script = _generate_script(topic)
    audio = _synthesize(script)
    return TopicAudioResponse(
        topic_id=topic["topic_id"],
        title=topic["title"],
        category=topic["category"],
        script=script,
        audio_base64=base64.b64encode(audio).decode("ascii"),
    )
