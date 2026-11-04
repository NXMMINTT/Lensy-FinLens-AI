from datetime import date

import pytest

from app.services import gemini_service


class _FakeMessage:
    def __init__(self, content: str):
        self.content = content


class _FakeChoice:
    def __init__(self, content: str):
        self.message = _FakeMessage(content)


class _FakeCompletion:
    def __init__(self, content: str):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def __init__(self, response_text: str):
        self._response_text = response_text
        self.last_call: dict | None = None

    def create(self, *, model: str, messages: list[dict], response_format: dict) -> _FakeCompletion:
        self.last_call = {"model": model, "messages": messages}
        return _FakeCompletion(self._response_text)


class _FakeChat:
    def __init__(self, response_text: str):
        self.completions = _FakeCompletions(response_text)


class _FakeClient:
    def __init__(self, response_text: str):
        self.chat = _FakeChat(response_text)


@pytest.fixture(autouse=True)
def _clear_client_cache():
    gemini_service._client.cache_clear()
    yield
    gemini_service._client.cache_clear()


def test_parse_user_message_record_transactions(monkeypatch: pytest.MonkeyPatch):
    fake = _FakeClient(
        """
        {
          "intent": "record_transactions",
          "transactions": [
            {
              "type": "income",
              "amount": 3500,
              "category_hint": "ขายหน้าร้าน",
              "description": "ขายของหน้าร้าน",
              "txn_date": "2026-10-15",
              "is_personal": false,
              "confidence": 0.92
            }
          ],
          "clarification_question": null
        }
        """
    )
    monkeypatch.setattr(gemini_service, "_client", lambda: fake)

    result = gemini_service.parse_user_message("ขายของได้ 3500", today=date(2026, 10, 15))

    assert result.intent.value == "record_transactions"
    assert len(result.transactions) == 1
    assert result.transactions[0].amount == 3500
    assert fake.chat.completions.last_call["model"] == gemini_service.settings.kku_model
    assert "2026-10-15" in fake.chat.completions.last_call["messages"][-1]["content"]


def test_parse_user_message_strips_markdown_fences(monkeypatch: pytest.MonkeyPatch):
    fake = _FakeClient('```json\n{"intent": "summary_request", "transactions": []}\n```')
    monkeypatch.setattr(gemini_service, "_client", lambda: fake)

    result = gemini_service.parse_user_message("สรุปยอดเดือนนี้", today=date(2026, 10, 15))

    assert result.intent.value == "summary_request"


def test_parse_user_message_tolerates_stray_backslash(monkeypatch: pytest.MonkeyPatch):
    fake = _FakeClient(
        r'{"intent": "record_transactions", "transactions": [{"type": "expense", "amount": 120,'
        r' "category_hint": "อื่นๆ", "description": "ค่าส่ง A\B", "txn_date": "2026-10-15", "confidence": 0.9}]}'
    )
    monkeypatch.setattr(gemini_service, "_client", lambda: fake)

    result = gemini_service.parse_user_message("ค่าส่ง 120", today=date(2026, 10, 15))

    assert result.transactions[0].description == "ค่าส่ง A\\B"


def test_parse_user_media_transcodes_m4a_to_mp3(monkeypatch: pytest.MonkeyPatch):
    fake = _FakeClient('{"intent": "other", "transactions": []}')
    monkeypatch.setattr(gemini_service, "_client", lambda: fake)
    monkeypatch.setattr(gemini_service, "_to_mp3", lambda data: b"mp3-bytes")

    gemini_service.parse_user_media(b"m4a-bytes", "audio/x-m4a", today=date(2026, 10, 15))

    media = fake.chat.completions.last_call["messages"][-1]["content"][0]
    assert media["input_audio"]["format"] == "mp3"
    assert media["input_audio"]["data"] == "bXAzLWJ5dGVz"  # base64 of b"mp3-bytes"


def test_parse_user_media_sends_image_as_data_url(monkeypatch: pytest.MonkeyPatch):
    fake = _FakeClient('{"intent": "other", "transactions": []}')
    monkeypatch.setattr(gemini_service, "_client", lambda: fake)

    gemini_service.parse_user_media(b"\x89PNG", "image/png", today=date(2026, 10, 15))

    media = fake.chat.completions.last_call["messages"][-1]["content"][0]
    assert media["type"] == "image_url"
    assert media["image_url"]["url"].startswith("data:image/png;base64,")


def test_parse_user_message_other_intent_with_clarification(monkeypatch: pytest.MonkeyPatch):
    fake = _FakeClient(
        """
        {"intent": "other", "transactions": [], "clarification_question": "หมายถึงอะไรคะ"}
        """
    )
    monkeypatch.setattr(gemini_service, "_client", lambda: fake)

    result = gemini_service.parse_user_message("สวัสดี", today=date(2026, 10, 15))

    assert result.intent.value == "other"
    assert result.transactions == []
    assert result.clarification_question == "หมายถึงอะไรคะ"
