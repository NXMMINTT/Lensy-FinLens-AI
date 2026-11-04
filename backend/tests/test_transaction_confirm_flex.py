from datetime import date
from decimal import Decimal

from app.line_messages.transaction_confirm import build_transaction_confirmation_message
from app.models import Transaction
from app.models.enums import IncomeExpenseType, TransactionSource, TransactionStatus


def _txn(id_: int, amount: str, confidence: str | None, type_=IncomeExpenseType.INCOME) -> Transaction:
    return Transaction(
        id=id_,
        business_id=1,
        type=type_,
        amount=Decimal(amount),
        description="ขายของหน้าร้าน",
        txn_date=date(2026, 10, 15),
        is_personal=False,
        source=TransactionSource.TEXT,
        ai_confidence=Decimal(confidence) if confidence else None,
        status=TransactionStatus.PENDING,
    )


def test_builds_one_bubble_per_transaction():
    message = build_transaction_confirmation_message([_txn(1, "3500", "0.9"), _txn(2, "1200", "0.9")])
    assert len(message.contents.contents) == 2


def test_alt_text_mentions_count():
    message = build_transaction_confirmation_message([_txn(1, "3500", "0.9")])
    assert "1" in message.alt_text


def _all_texts(box) -> list[str]:
    """Collect every FlexText string in a box, recursing into nested FlexBoxes."""
    texts: list[str] = []
    for c in getattr(box, "contents", []):
        if hasattr(c, "text"):
            texts.append(c.text)
        elif hasattr(c, "contents"):
            texts.extend(_all_texts(c))
    return texts


def test_low_confidence_adds_warning_text():
    message = build_transaction_confirmation_message([_txn(1, "3500", "0.5")])
    bubble = message.contents.contents[0]
    texts = _all_texts(bubble.body)
    assert any("โปรดตรวจสอบอีกครั้ง" in t for t in texts)


def test_high_confidence_has_no_warning_text():
    message = build_transaction_confirmation_message([_txn(1, "3500", "0.95")])
    bubble = message.contents.contents[0]
    texts = [c.text for c in bubble.body.contents if hasattr(c, "text")]
    assert not any("โปรดตรวจสอบอีกครั้ง" in t for t in texts)


def test_confirm_and_cancel_postback_data_reference_transaction_id():
    message = build_transaction_confirmation_message([_txn(42, "3500", "0.9")])
    bubble = message.contents.contents[0]
    datas = [b.action.data for b in bubble.footer.contents if hasattr(b.action, "data")]
    assert "action=confirm&id=42" in datas
    assert "action=cancel&id=42" in datas


def test_edit_button_is_a_chat_postback_without_liff(monkeypatch):
    from app.line_messages import transaction_confirm

    monkeypatch.setattr(transaction_confirm.settings, "liff_id", "")
    bubble = build_transaction_confirmation_message([_txn(42, "3500", "0.9")]).contents.contents[0]
    datas = [a.data for a in _all_actions(bubble.body) if hasattr(a, "data")]
    assert "action=edit&id=42" in datas


def test_edit_button_opens_liff_form_when_liff_is_set(monkeypatch):
    from app.line_messages import transaction_confirm

    monkeypatch.setattr(transaction_confirm.settings, "liff_id", "1234567890-abcdefgh")
    bubble = build_transaction_confirmation_message([_txn(42, "3500", "0.9")]).contents.contents[0]
    uris = {a.uri for a in _all_actions(bubble.body) if hasattr(a, "uri")}
    assert uris == {"https://liff.line.me/1234567890-abcdefgh/transactions?edit=42"}


def _all_actions(box) -> list:
    """Every action attached to a component inside `box`, recursively."""
    found = []
    for c in getattr(box, "contents", None) or []:
        if getattr(c, "action", None) is not None:
            found.append(c.action)
        found.extend(_all_actions(c))
    return found


def test_date_row_opens_date_picker_for_that_transaction():
    bubble = build_transaction_confirmation_message([_txn(42, "3500", "0.9")]).contents.contents[0]
    pickers = [a for a in _all_actions(bubble.body) if getattr(a, "mode", None) == "date"]
    assert len(pickers) == 1
    assert pickers[0].data == "action=edit_date&id=42"
    assert pickers[0].initial == "2026-10-15"


def test_expense_card_uses_red_theme_and_minus_sign():
    bubble = build_transaction_confirmation_message(
        [_txn(7, "2000", "0.9", type_=IncomeExpenseType.EXPENSE)]
    ).contents.contents[0]
    assert bubble.hero.url.endswith("banner-expense.jpg")
    assert "-฿2,000.00" in _all_texts(bubble.body)
