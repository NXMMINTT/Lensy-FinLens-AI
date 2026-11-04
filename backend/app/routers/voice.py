import base64

import httpx
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from app.core.ai_provider_settings import ELEVENLABS_API_KEY, ELEVENLABS_MODEL_ID, ELEVENLABS_VOICE_ID, GEMINI_MODEL
from app.routers.ubot import SYSTEM_PROMPT, build_context, get_client

router = APIRouter(prefix="/api/voice", tags=["voice"])

ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


class SpeakRequest(BaseModel):
    text: str


class AskSpeakRequest(BaseModel):
    question: str
    product_id: str | None = None


class AskSpeakResponse(BaseModel):
    answer: str
    audio_base64: str
    audio_mime: str = "audio/mpeg"


def _synthesize(text: str) -> bytes:
    if not ELEVENLABS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ELEVENLABS_API_KEY ยังไม่ได้ตั้งค่า — เพิ่มใน backend/.env ก่อนใช้งานเสียง U-Fox",
        )

    url = ELEVENLABS_TTS_URL.format(voice_id=ELEVENLABS_VOICE_ID)
    try:
        resp = httpx.post(
            url,
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "text": text,
                "model_id": ELEVENLABS_MODEL_ID,
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            },
            timeout=30.0,
        )
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"เรียก ElevenLabs ไม่สำเร็จ: {exc.response.status_code} {exc.response.text}",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"เรียก ElevenLabs ไม่สำเร็จ: {exc}") from exc

    return resp.content


@router.post("/speak")
def speak(req: SpeakRequest):
    audio = _synthesize(req.text)
    return Response(content=audio, media_type="audio/mpeg")


@router.post("/ask-and-speak", response_model=AskSpeakResponse)
def ask_and_speak(req: AskSpeakRequest):
    client = get_client()
    context = build_context(req.product_id)

    try:
        completion = client.chat.completions.create(
            model=GEMINI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "system", "content": f"CONTEXT:\n{context}"},
                {"role": "user", "content": req.question},
            ],
        )
    except Exception as exc:  # noqa: BLE001 - surface upstream error to caller
        raise HTTPException(status_code=502, detail=f"เรียก Gemini ไม่สำเร็จ: {exc}") from exc

    answer = (completion.choices[0].message.content or "").strip()
    audio = _synthesize(answer)
    return AskSpeakResponse(answer=answer, audio_base64=base64.b64encode(audio).decode("ascii"))
