import base64
import hashlib
import hmac
import json
from datetime import date
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from linebot.v3.webhook import WebhookParser
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models import Base
from app.routers import line_webhook
from app.schemas.gemini import GeminiParseResult, ParsedIntent, ParsedTransaction, ParsedTransactionType

TEST_SECRET = "test-channel-secret"


def _sign(body: bytes) -> str:
    mac = hmac.new(TEST_SECRET.encode("utf-8"), body, hashlib.sha256).digest()
    return base64.b64encode(mac).decode("utf-8")


def _message_event_body(text: str, user_id: str = "Utestuser1") -> bytes:
    payload = {
        "destination": "xxxxxxxxxx",
        "events": [
            {
                "type": "message",
                "message": {"type": "text", "id": "1", "text": text, "quoteToken": "test-quote-token"},
                "timestamp": 1462629479859,
                "source": {"type": "user", "userId": user_id},
                "replyToken": "test-reply-token",
                "mode": "active",
                "webhookEventId": "wh-1",
                "deliveryContext": {"isRedelivery": False},
            }
        ],
    }
    return json.dumps(payload).encode("utf-8")


def _postback_event_body(data: str, user_id: str = "Utestuser1") -> bytes:
    payload = {
        "destination": "xxxxxxxxxx",
        "events": [
            {
                "type": "postback",
                "postback": {"data": data},
                "timestamp": 1462629479859,
                "source": {"type": "user", "userId": user_id},
                "replyToken": "test-reply-token",
                "mode": "active",
                "webhookEventId": "wh-2",
                "deliveryContext": {"isRedelivery": False},
            }
        ],
    }
    return json.dumps(payload).encode("utf-8")


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setattr(line_webhook, "_parser", WebhookParser(TEST_SECRET))

    # Background tasks run in a worker thread; a plain sqlite:///:memory: engine
    # hands each thread its own private database, so share one connection via
    # StaticPool instead.
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    test_session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    monkeypatch.setattr(line_webhook, "SessionLocal", test_session_local)

    monkeypatch.setattr(line_webhook.line_service, "show_loading_animation", lambda *a, **k: None)
    monkeypatch.setattr(line_webhook.line_service, "reply_text", lambda *a, **k: None)
    monkeypatch.setattr(line_webhook.line_service, "reply_messages", lambda *a, **k: None)
    monkeypatch.setattr(line_webhook.line_service, "push_text", lambda *a, **k: None)
    monkeypatch.setattr(line_webhook.line_service, "push_messages", lambda *a, **k: None)

    return TestClient(app)


def test_invalid_signature_returns_400(client: TestClient):
    body = _message_event_body("ขายของได้ 100")
    response = client.post(
        "/api/v1/line/webhook", content=body, headers={"x-line-signature": "not-a-valid-signature"}
    )
    assert response.status_code == 400


def test_valid_signature_returns_200(client: TestClient):
    body = _message_event_body("ขายของได้ 100")
    response = client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})
    assert response.status_code == 200


def test_text_message_creates_pending_transaction(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    parsed = GeminiParseResult(
        intent=ParsedIntent.RECORD_TRANSACTIONS,
        transactions=[
            ParsedTransaction(
                type=ParsedTransactionType.INCOME,
                amount=Decimal("3500"),
                category_hint="ขายหน้าร้าน",
                description="ขายหน้าร้าน",
                txn_date=date(2026, 10, 15),
                is_personal=False,
                confidence=Decimal("0.9"),
            )
        ],
        clarification_question=None,
    )
    sent_messages = []
    monkeypatch.setattr(line_webhook.gemini_service, "parse_user_message", lambda text, **kwargs: parsed)
    monkeypatch.setattr(
        line_webhook.line_service, "reply_messages", lambda token, messages: sent_messages.append(messages)
    )

    body = _message_event_body("ขายของได้ 3500")
    response = client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    assert response.status_code == 200
    assert len(sent_messages) == 1
    assert len(sent_messages[0][0].contents.contents) == 1


def test_confirm_postback_marks_transaction_confirmed(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    parsed = GeminiParseResult(
        intent=ParsedIntent.RECORD_TRANSACTIONS,
        transactions=[
            ParsedTransaction(
                type=ParsedTransactionType.INCOME,
                amount=Decimal("3500"),
                category_hint="ขายหน้าร้าน",
                description="ขายหน้าร้าน",
                txn_date=date(2026, 10, 15),
                is_personal=False,
                confidence=Decimal("0.9"),
            )
        ],
        clarification_question=None,
    )
    monkeypatch.setattr(line_webhook.gemini_service, "parse_user_message", lambda text, **kwargs: parsed)

    body = _message_event_body("ขายของได้ 3500")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    session = line_webhook.SessionLocal()
    from app.models import Transaction
    from app.models.enums import TransactionStatus

    txn = session.query(Transaction).one()
    assert txn.status == TransactionStatus.PENDING
    session.close()

    confirm_body = _postback_event_body(f"action=confirm&id={txn.id}")
    response = client.post(
        "/api/v1/line/webhook", content=confirm_body, headers={"x-line-signature": _sign(confirm_body)}
    )
    assert response.status_code == 200

    session = line_webhook.SessionLocal()
    refreshed = session.query(Transaction).one()
    assert refreshed.status == TransactionStatus.CONFIRMED
    session.close()


def test_edit_postback_cancels_draft_and_asks_for_correction(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    parsed = GeminiParseResult(
        intent=ParsedIntent.RECORD_TRANSACTIONS,
        transactions=[
            ParsedTransaction(
                type=ParsedTransactionType.INCOME,
                amount=Decimal("3500"),
                category_hint="ขายหน้าร้าน",
                description="ขายหน้าร้าน",
                txn_date=date(2026, 10, 15),
                is_personal=False,
                confidence=Decimal("0.9"),
            )
        ],
        clarification_question=None,
    )
    replies = []
    monkeypatch.setattr(line_webhook.gemini_service, "parse_user_message", lambda text, **kwargs: parsed)
    monkeypatch.setattr(line_webhook.line_service, "reply_text", lambda token, text: replies.append(text))

    body = _message_event_body("ขายของได้ 3500")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    from app.models import Transaction
    from app.models.enums import TransactionStatus

    session = line_webhook.SessionLocal()
    txn_id = session.query(Transaction).one().id
    session.close()

    edit_body = _postback_event_body(f"action=edit&id={txn_id}")
    client.post("/api/v1/line/webhook", content=edit_body, headers={"x-line-signature": _sign(edit_body)})

    session = line_webhook.SessionLocal()
    assert session.query(Transaction).one().status == TransactionStatus.CANCELLED
    session.close()
    assert replies[-1] == line_webhook.th.TRANSACTION_EDIT_REPLY


def test_rich_menu_howto_postback_replies_with_instructions(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    sent_messages = []
    monkeypatch.setattr(
        line_webhook.line_service, "reply_messages", lambda token, messages: sent_messages.append(messages)
    )

    body = _postback_event_body("action=menu_howto")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    assert len(sent_messages) == 1
    assert "วิธีใช้งาน" in sent_messages[0][0].alt_text


def test_rich_menu_help_postback_replies_with_help_text(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    sent_messages = []
    monkeypatch.setattr(
        line_webhook.line_service, "reply_messages", lambda token, messages: sent_messages.append(messages)
    )

    body = _postback_event_body("action=menu_help")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    assert len(sent_messages) == 1
    assert "สวัสดี" in sent_messages[0][0].alt_text


def test_rich_menu_summary_postback_replies_with_daily_summary(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    sent_messages = []
    monkeypatch.setattr(
        line_webhook.line_service, "reply_messages", lambda token, messages: sent_messages.append(messages)
    )

    body = _postback_event_body("action=menu_summary")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    assert len(sent_messages) == 1
    assert "สรุปภาพรวม" in sent_messages[0][0].alt_text


def test_unsupported_message_type_replies_politely(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    sent = []
    monkeypatch.setattr(line_webhook.line_service, "reply_text", lambda token, text: sent.append(text))
    payload = {
        "destination": "xxxxxxxxxx",
        "events": [
            {
                "type": "message",
                "message": {
                    "type": "sticker",
                    "id": "1",
                    "packageId": "1",
                    "stickerId": "1",
                    "stickerResourceType": "STATIC",
                    "quoteToken": "test-quote-token",
                },
                "timestamp": 1462629479859,
                "source": {"type": "user", "userId": "Utestuser1"},
                "replyToken": "test-reply-token",
                "mode": "active",
                "webhookEventId": "wh-3",
                "deliveryContext": {"isRedelivery": False},
            }
        ],
    }
    body = json.dumps(payload).encode("utf-8")
    response = client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})
    assert response.status_code == 200
    assert len(sent) == 1


def _image_event_body(message_id: str = "img-1", user_id: str = "Utestuser1") -> bytes:
    payload = {
        "destination": "xxxxxxxxxx",
        "events": [
            {
                "type": "message",
                "message": {
                    "type": "image",
                    "id": message_id,
                    "contentProvider": {"type": "line"},
                    "quoteToken": "test-quote-token",
                },
                "timestamp": 1462629479859,
                "source": {"type": "user", "userId": user_id},
                "replyToken": "test-reply-token",
                "mode": "active",
                "webhookEventId": "wh-4",
                "deliveryContext": {"isRedelivery": False},
            }
        ],
    }
    return json.dumps(payload).encode("utf-8")


def test_image_message_parses_slip_and_saves_attachment(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, tmp_path
):
    parsed = GeminiParseResult(
        intent=ParsedIntent.RECORD_TRANSACTIONS,
        transactions=[
            ParsedTransaction(
                type=ParsedTransactionType.EXPENSE,
                amount=Decimal("1200"),
                category_hint="ค่าซื้อสินค้า",
                description="ซื้อน้ำพริกเผาจากผู้ผลิต",
                txn_date=date(2026, 10, 15),
                product_name="น้ำพริกเผา",
                quantity=Decimal("20"),
                confidence=Decimal("0.9"),
            )
        ],
    )
    media_calls = []
    sent_messages = []
    monkeypatch.setattr(line_webhook.settings, "upload_dir", tmp_path)
    monkeypatch.setattr(line_webhook.line_service, "get_message_content", lambda mid: (b"fake-jpeg", "image/jpeg"))
    monkeypatch.setattr(
        line_webhook.gemini_service,
        "parse_user_media",
        lambda data, mime, **kwargs: media_calls.append((data, mime)) or parsed,
    )
    monkeypatch.setattr(
        line_webhook.line_service, "reply_messages", lambda token, messages: sent_messages.append(messages)
    )

    body = _image_event_body()
    response = client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})
    assert response.status_code == 200
    assert media_calls == [(b"fake-jpeg", "image/jpeg")]
    assert len(sent_messages) == 1

    from app.models import Attachment, Transaction
    from app.models.enums import TransactionSource

    session = line_webhook.SessionLocal()
    txn = session.query(Transaction).one()
    assert txn.source == TransactionSource.IMAGE
    assert txn.product.name == "น้ำพริกเผา"
    attachment = session.query(Attachment).one()
    assert attachment.transaction_id == txn.id
    assert attachment.mime_type == "image/jpeg"
    session.close()
    assert (tmp_path / "line-img-1.jpg").read_bytes() == b"fake-jpeg"


def test_confirming_sale_replies_with_remaining_stock(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from app.models import Business, Product, User
    from app.models.enums import ExpenseMethod, TaxStatus

    session = line_webhook.SessionLocal()
    user = User(line_user_id="Utestuser1", display_name="t")
    session.add(user)
    session.flush()
    biz = Business(
        owner_id=user.id,
        name="ร้าน",
        business_type="อื่นๆ",
        tax_status=TaxStatus.INDIVIDUAL,
        vat_registered=False,
        expense_method=ExpenseMethod.FLAT_RATE,
    )
    session.add(biz)
    session.flush()
    session.add(Product(business_id=biz.id, name="กล้วยตาก", unit="ถุง", stock_qty=Decimal("10")))
    session.commit()
    session.close()

    parsed = GeminiParseResult(
        intent=ParsedIntent.RECORD_TRANSACTIONS,
        transactions=[
            ParsedTransaction(
                type=ParsedTransactionType.INCOME,
                amount=Decimal("300"),
                category_hint="ขายออนไลน์",
                description="ขายกล้วยตาก",
                txn_date=date(2026, 10, 15),
                product_name="กล้วยตาก",
                quantity=Decimal("3"),
                confidence=Decimal("0.9"),
            )
        ],
    )
    seen_products = []
    monkeypatch.setattr(
        line_webhook.gemini_service,
        "parse_user_message",
        lambda text, known_products=None, **kwargs: seen_products.append(known_products) or parsed,
    )
    replies = []
    monkeypatch.setattr(line_webhook.line_service, "reply_text", lambda token, text: replies.append(text))

    body = _message_event_body("ขายกล้วยตาก 3 ถุง 300")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})
    assert seen_products == [["กล้วยตาก"]]

    from app.models import Transaction

    session = line_webhook.SessionLocal()
    txn_id = session.query(Transaction).one().id
    session.close()

    confirm_body = _postback_event_body(f"action=confirm&id={txn_id}")
    client.post("/api/v1/line/webhook", content=confirm_body, headers={"x-line-signature": _sign(confirm_body)})

    assert replies[-1].endswith("📦 กล้วยตาก คงเหลือ 7 ถุง")


def _postback_with_date_body(data: str, picked: str, user_id: str = "Utestuser1") -> bytes:
    payload = json.loads(_postback_event_body(data, user_id))
    payload["events"][0]["postback"]["params"] = {"date": picked}
    return json.dumps(payload).encode("utf-8")


def _record_one_income(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> int:
    parsed = GeminiParseResult(
        intent=ParsedIntent.RECORD_TRANSACTIONS,
        transactions=[
            ParsedTransaction(
                type=ParsedTransactionType.INCOME,
                amount=Decimal("3500"),
                category_hint="ขายหน้าร้าน",
                description="ขายหน้าร้าน",
                txn_date=date(2026, 10, 15),
                is_personal=False,
                confidence=Decimal("0.9"),
            )
        ],
        clarification_question=None,
    )
    monkeypatch.setattr(line_webhook.gemini_service, "parse_user_message", lambda text, **kwargs: parsed)
    body = _message_event_body("ขายของได้ 3500")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})
    from app.models import Transaction

    from app.models.enums import TransactionStatus

    session = line_webhook.SessionLocal()
    txn_id = session.query(Transaction).filter_by(status=TransactionStatus.PENDING).one().id
    session.close()
    return txn_id


def test_edit_date_postback_updates_date_and_resends_card(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    txn_id = _record_one_income(client, monkeypatch)
    sent = []
    monkeypatch.setattr(line_webhook.line_service, "reply_messages", lambda token, messages: sent.append(messages))

    body = _postback_with_date_body(f"action=edit_date&id={txn_id}", "2026-10-01")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    from app.models import Transaction
    from app.models.enums import TransactionStatus

    session = line_webhook.SessionLocal()
    txn = session.query(Transaction).one()
    assert txn.txn_date == date(2026, 10, 1)
    assert txn.status == TransactionStatus.PENDING
    session.close()
    assert len(sent) == 1 and "กรุณายืนยัน" in sent[0][0].alt_text


def test_tax_question_replies_with_tax_alert_card(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    parsed = GeminiParseResult(intent=ParsedIntent.TAX_QUESTION, transactions=[], clarification_question=None)
    monkeypatch.setattr(line_webhook.gemini_service, "parse_user_message", lambda text, **kwargs: parsed)
    sent = []
    monkeypatch.setattr(line_webhook.line_service, "reply_messages", lambda token, messages: sent.append(messages))

    body = _message_event_body("ภาษีเป็นยังไงบ้าง")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    assert len(sent) == 1
    assert "แจ้งเตือนภาษี · โซนเขียว" in sent[0][0].alt_text


def test_year_summary_request_replies_with_year_card(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    parsed = GeminiParseResult(intent=ParsedIntent.SUMMARY_REQUEST, transactions=[], clarification_question=None)
    monkeypatch.setattr(line_webhook.gemini_service, "parse_user_message", lambda text, **kwargs: parsed)
    sent = []
    monkeypatch.setattr(line_webhook.line_service, "reply_messages", lambda token, messages: sent.append(messages))

    body = _message_event_body("สรุปทั้งปีให้หน่อย")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    assert len(sent) == 1
    assert sent[0][0].alt_text.startswith("สรุปปี ")


@pytest.mark.parametrize(
    ("data", "expect_flex"),
    [("action=tax_snooze", False), ("action=tax_detail", False), ("action=year_report", True), ("action=month_summary", True)],
)
def test_card_buttons_without_liff_reply(client: TestClient, monkeypatch: pytest.MonkeyPatch, data, expect_flex):
    texts, flexes = [], []
    monkeypatch.setattr(line_webhook.line_service, "reply_text", lambda token, text: texts.append(text))
    monkeypatch.setattr(line_webhook.line_service, "reply_messages", lambda token, messages: flexes.append(messages))

    body = _postback_event_body(data)
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    assert (len(flexes), len(texts)) == ((1, 0) if expect_flex else (0, 1))


def test_confirm_near_vat_ceiling_pushes_tax_alert_card(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from app.models import Business, Transaction, User
    from app.models.enums import (
        ExpenseMethod,
        IncomeExpenseType,
        TaxStatus,
        TransactionSource,
        TransactionStatus,
    )

    session = line_webhook.SessionLocal()
    user = User(line_user_id="Utestuser1", display_name="t")
    session.add(user)
    session.flush()
    biz = Business(
        owner_id=user.id,
        name="ร้าน",
        business_type="อื่นๆ",
        tax_status=TaxStatus.INDIVIDUAL,
        vat_registered=False,
        expense_method=ExpenseMethod.FLAT_RATE,
    )
    session.add(biz)
    session.flush()
    session.add(
        Transaction(
            business_id=biz.id,
            type=IncomeExpenseType.INCOME,
            amount=Decimal("1600000"),
            txn_date=date.today(),
            is_personal=False,
            source=TransactionSource.TEXT,
            status=TransactionStatus.CONFIRMED,
        )
    )
    session.commit()
    session.close()

    txn_id = _record_one_income(client, monkeypatch)
    pushed = []
    monkeypatch.setattr(line_webhook.line_service, "push_messages", lambda user_id, messages: pushed.append(messages))

    body = _postback_event_body(f"action=confirm&id={txn_id}")
    client.post("/api/v1/line/webhook", content=body, headers={"x-line-signature": _sign(body)})

    assert len(pushed) == 1
    assert "แจ้งเตือนภาษี" in pushed[0][0].alt_text
