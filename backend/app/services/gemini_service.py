"""Calls Gemini (via KKU IntelSphere's OpenAI-compatible API) to parse a
user's LINE message (text, slip image, or voice clip) into structured
transaction data. Gemini never computes tax or totals — see app/tax_engine
for that.
"""

import base64
import json
import re
import subprocess
import tempfile
from datetime import date
from functools import lru_cache
from pathlib import Path

import imageio_ffmpeg
from openai import OpenAI

from app.core.settings import settings
from app.schemas.gemini import GeminiParseResult

_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "transaction_parser_system.md"

# KKU accepts only mp3/wav audio (m4a comes back as an error), but LINE voice
# clips arrive as m4a — so anything that isn't mp3/wav is transcoded to mp3.
_AUDIO_FORMATS = {"audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/wav": "wav", "audio/x-wav": "wav"}


def _to_mp3(data: bytes) -> bytes:
    # A temp file rather than a pipe: m4a's index can sit at the end of the file.
    with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as src:
        src.write(data)
    try:
        return subprocess.run(
            [imageio_ffmpeg.get_ffmpeg_exe(), "-loglevel", "error", "-i", src.name, "-ac", "1", "-b:a", "64k", "-f", "mp3", "pipe:1"],
            capture_output=True,
            check=True,
        ).stdout
    finally:
        Path(src.name).unlink(missing_ok=True)


@lru_cache(maxsize=1)
def _system_prompt() -> str:
    schema = json.dumps(GeminiParseResult.model_json_schema(), ensure_ascii=False)
    return (
        _PROMPT_PATH.read_text(encoding="utf-8")
        + "\n\nตอบเป็น JSON เท่านั้น (ไม่มีข้อความอื่น ไม่มี markdown) ตาม JSON Schema นี้:\n"
        + schema
    )


@lru_cache(maxsize=1)
def _client() -> OpenAI:
    return OpenAI(base_url=settings.kku_base_url, api_key=settings.kku_api_key)


def _context(today: date | None, known_products: list[str] | None) -> str:
    today = today or date.today()
    context = f"วันที่ปัจจุบัน: {today.isoformat()}"
    if known_products:
        context += f"\nสินค้าในร้าน: {', '.join(known_products)}"
    return context


def parse_user_message(
    text: str, today: date | None = None, known_products: list[str] | None = None
) -> GeminiParseResult:
    return _generate(f"{_context(today, known_products)}\n\nข้อความจากผู้ใช้:\n{text}")


def parse_user_media(
    data: bytes, mime_type: str, today: date | None = None, known_products: list[str] | None = None
) -> GeminiParseResult:
    """Parses a slip/receipt image or a voice clip downloaded from LINE."""
    if mime_type.startswith("audio/"):
        audio_format = _AUDIO_FORMATS.get(mime_type)
        if audio_format is None:
            data, audio_format = _to_mp3(data), "mp3"
        media = {"type": "input_audio", "input_audio": {"data": base64.b64encode(data).decode(), "format": audio_format}}
    else:
        encoded = base64.b64encode(data).decode()
        media = {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{encoded}"}}
    return _generate(
        [
            media,
            {
                "type": "text",
                "text": f"{_context(today, known_products)}\n\nไฟล์แนบจากผู้ใช้ (รูปสลิป/ใบเสร็จ หรือข้อความเสียง) อยู่ด้านบน",
            },
        ]
    )


def _generate(content: str | list) -> GeminiParseResult:
    completion = _client().chat.completions.create(
        model=settings.kku_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": _system_prompt()},
            {"role": "user", "content": content},
        ],
    )
    # KKU reports upstream errors as HTTP 200 with no choices, e.g. {"status": 400}.
    if not completion.choices:
        raise RuntimeError(f"KKU returned no choices: {completion.model_dump_json()[:200]}")
    text = completion.choices[0].message.content or ""
    # Models sometimes wrap JSON in ```json fences despite the instruction.
    text = re.sub(r"^\s*```(?:json)?\s*|\s*```\s*$", "", text)
    # ...and copy stray backslashes from slip text, which aren't valid JSON escapes.
    text = re.sub(r'\\(?!["\\/bfnrtu])', r"\\\\", text)
    return GeminiParseResult.model_validate_json(text)
