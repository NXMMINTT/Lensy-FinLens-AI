import logging
import mimetypes
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request
from linebot.v3.webhook import InvalidSignatureError, WebhookParser
from linebot.v3.webhooks import (
    AudioMessageContent,
    Event,
    ImageMessageContent,
    MessageEvent,
    PostbackEvent,
    TextMessageContent,
    UserSource,
)
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.settings import settings
from app.analytics import business_overview
from app.line_messages.summary import build_summary_flex
from app.line_messages.tax_alert import build_tax_alert_flex
from app.line_messages.transaction_confirm import build_transaction_confirmation_message
from app.line_messages.welcome import build_howto_flex, build_welcome_flex
from app.line_messages.year_summary import ProductShare, build_year_summary_flex
from app.locales import th
from app.models import Attachment, Business, Transaction
from app.models.enums import TransactionSource, TransactionStatus
from app.schemas.gemini import ParsedIntent
from app.services import gemini_service, inventory_service, line_service, transaction_service, user_service
from app.tax_engine import vat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/line", tags=["line"])

_parser = WebhookParser(settings.line_channel_secret)


@router.post("/webhook")
async def line_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_line_signature: str = Header(...),
) -> dict[str, str]:
    body = (await request.body()).decode("utf-8")
    try:
        events = _parser.parse(body, x_line_signature)
    except InvalidSignatureError as exc:
        raise HTTPException(status_code=400, detail="invalid signature") from exc

    for event in events:
        background_tasks.add_task(_handle_event, event)

    return {"status": "ok"}


def _handle_event(event: Event) -> None:
    db = SessionLocal()
    try:
        if isinstance(event, MessageEvent):
            _handle_message_event(db, event)
        elif isinstance(event, PostbackEvent):
            _handle_postback_event(db, event)
    except Exception:
        logger.exception("failed to handle LINE event")
        reply_token = getattr(event, "reply_token", None)
        if reply_token:
            try:
                line_service.reply_text(reply_token, th.GENERIC_ERROR_REPLY)
            except Exception:
                logger.exception("failed to send error reply")
    finally:
        db.close()


def _resolve_business(db: Session, line_user_id: str) -> Business:
    user = user_service.get_or_create_user(db, line_user_id)
    business = user_service.get_or_create_default_business(db, user)
    db.commit()
    return business


def _handle_message_event(db: Session, event: MessageEvent) -> None:
    if not isinstance(event.source, UserSource) or event.source.user_id is None:
        return
    line_user_id = event.source.user_id

    message = event.message
    if not isinstance(message, (TextMessageContent, ImageMessageContent, AudioMessageContent)):
        line_service.reply_text(event.reply_token, th.UNSUPPORTED_MESSAGE_TYPE_REPLY)
        return

    line_service.show_loading_animation(line_user_id)
    business = _resolve_business(db, line_user_id)
    known_products = inventory_service.list_product_names(db, business.id)

    media: tuple[bytes, str] | None = None
    if isinstance(message, TextMessageContent):
        source, raw_input = TransactionSource.TEXT, message.text
        parsed = gemini_service.parse_user_message(message.text, known_products=known_products)
    else:
        source = TransactionSource.IMAGE if isinstance(message, ImageMessageContent) else TransactionSource.VOICE
        raw_input = None
        media = line_service.get_message_content(message.id)
        parsed = gemini_service.parse_user_media(*media, known_products=known_products)

    if parsed.intent == ParsedIntent.RECORD_TRANSACTIONS and parsed.transactions:
        created = transaction_service.create_pending_transactions(
            db, business, parsed, source=source, raw_input=raw_input
        )
        if media is not None:
            _save_attachment(db, message.id, *media, created)
        db.commit()
        line_service.reply_messages(
            event.reply_token, [build_transaction_confirmation_message(created)]
        )
        return

    if parsed.intent == ParsedIntent.TAX_QUESTION:
        annual_income = transaction_service.current_year_confirmed_income(db, business.id)
        line_service.reply_messages(event.reply_token, [build_tax_alert_flex(annual_income)])
        return

    if parsed.intent == ParsedIntent.SUMMARY_REQUEST and raw_input and "ปี" in raw_input:
        line_service.reply_messages(event.reply_token, [_year_summary(db, business)])
        return

    if parsed.intent == ParsedIntent.SUMMARY_REQUEST:
        income_total, expense_total = transaction_service.day_totals(db, business.id, date.today())
        flex = build_summary_flex(income_total, expense_total, period_label="วันนี้")
        line_service.reply_messages(event.reply_token, [flex])
        return

    line_service.reply_text(
        event.reply_token, parsed.clarification_question or th.NO_TRANSACTIONS_PARSED_REPLY
    )


def _handle_postback_event(db: Session, event: PostbackEvent) -> None:
    if not isinstance(event.source, UserSource) or event.source.user_id is None:
        return
    line_user_id = event.source.user_id

    params = dict(pair.split("=", 1) for pair in event.postback.data.split("&") if "=" in pair)
    action = params.get("action")

    # Rich menu buttons that don't reference a transaction id.
    if action == "menu_greeting":
        line_service.reply_messages(event.reply_token, [build_welcome_flex()])
        return
    if action == "menu_howto":
        line_service.reply_messages(event.reply_token, [build_howto_flex()])
        return
    if action == "menu_help":
        line_service.reply_messages(event.reply_token, [build_welcome_flex()])
        return
    if action == "menu_settings":
        line_service.reply_text(event.reply_token, "⚙️ ฟีเจอร์ตั้งค่าร้านกำลังพัฒนาอยู่ครับ รอติดตามเร็วๆ นี้!")
        return
    if action == "menu_summary":
        business = _resolve_business(db, line_user_id)
        income_total, expense_total = transaction_service.day_totals(db, business.id, date.today())
        flex = build_summary_flex(income_total, expense_total, period_label="วันนี้")
        line_service.reply_messages(event.reply_token, [flex])
        return

    # Buttons on the tax alert / year summary cards (shown when LIFF_ID isn't set).
    if action == "tax_detail":
        business = _resolve_business(db, line_user_id)
        line_service.reply_text(event.reply_token, _tax_status_reply(db, business))
        return
    if action == "tax_snooze":
        line_service.reply_text(event.reply_token, th.TAX_SNOOZE_REPLY)
        return
    if action == "year_report":
        business = _resolve_business(db, line_user_id)
        line_service.reply_messages(event.reply_token, [_year_summary(db, business)])
        return
    if action == "month_summary":
        business = _resolve_business(db, line_user_id)
        today = date.today()
        income_total, expense_total = business_overview.period_totals(
            db, business.id, today.replace(day=1), today
        )
        flex = build_summary_flex(income_total, expense_total, period_label="เดือนนี้")
        line_service.reply_messages(event.reply_token, [flex])
        return

    txn_id_raw = params.get("id")
    if action not in {"confirm", "cancel", "edit", "edit_date"} or txn_id_raw is None or not txn_id_raw.isdigit():
        if action and action.startswith("menu_"):
            line_service.reply_messages(event.reply_token, [build_welcome_flex()])
        return
    txn_id = int(txn_id_raw)

    business = _resolve_business(db, line_user_id)

    try:
        txn = transaction_service.get_owned_transaction(db, txn_id, business.id)
    except transaction_service.TransactionNotFoundError:
        line_service.reply_text(event.reply_token, th.TRANSACTION_NOT_FOUND_REPLY)
        return

    if txn.status != TransactionStatus.PENDING:
        line_service.reply_text(event.reply_token, th.TRANSACTION_ALREADY_RESOLVED_REPLY)
        return

    if action == "edit_date":
        picked = (event.postback.params or {}).get("date")
        if picked:
            txn.txn_date = date.fromisoformat(picked)
            db.commit()
            db.refresh(txn)
        line_service.reply_messages(event.reply_token, [build_transaction_confirmation_message([txn])])
        return

    if action == "confirm":
        transaction_service.confirm_transaction(db, txn_id, business.id)
        db.commit()
        reply = th.TRANSACTION_CONFIRMED_REPLY
        if txn.product is not None and txn.quantity is not None and not txn.is_personal:
            reply += "\n" + th.stock_remaining_line(txn.product.name, txn.product.stock_qty, txn.product.unit)
        line_service.reply_text(event.reply_token, reply)
        _maybe_push_vat_warning(db, business, line_user_id)
    else:
        # "edit" without LIFF: drop the draft and let the user send the corrected one.
        transaction_service.cancel_transaction(db, txn_id, business.id)
        db.commit()
        reply = th.TRANSACTION_EDIT_REPLY if action == "edit" else th.TRANSACTION_CANCELLED_REPLY
        line_service.reply_text(event.reply_token, reply)


def _save_attachment(
    db: Session, message_id: str, data: bytes, mime_type: str, transactions: list[Transaction]
) -> None:
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    extension = mimetypes.guess_extension(mime_type) or ".bin"
    path = settings.upload_dir / f"line-{message_id}{extension}"
    path.write_bytes(data)
    for txn in transactions:
        db.add(Attachment(transaction_id=txn.id, file_path=str(path), mime_type=mime_type))
    db.flush()


def _tax_status_reply(db: Session, business: Business) -> str:
    annual_income = transaction_service.current_year_confirmed_income(db, business.id)
    ratio = vat.vat_threshold_ratio(annual_income)
    required = vat.is_vat_registration_required(annual_income)
    return th.tax_status_reply(annual_income, _percent(ratio), required)


def _maybe_push_vat_warning(db: Session, business: Business, line_user_id: str) -> None:
    annual_income = transaction_service.current_year_confirmed_income(db, business.id)
    level = vat.vat_warning_level(annual_income)
    if level is None:
        return
    line_service.push_messages(line_user_id, [build_tax_alert_flex(annual_income)])


def _year_summary(db: Session, business: Business):
    today = date.today()
    start = date(today.year, 1, 1)
    income_total, expense_total = business_overview.period_totals(db, business.id, start, today)
    top = business_overview.top_products(db, business.id, start, today, limit=3)
    shares = [
        ProductShare(name=item.product.name, share_percent=item.revenue / income_total * 100)
        for item in top
        if income_total > 0
    ]
    return build_year_summary_flex(today.year, income_total, expense_total, shares)


def _percent(ratio: Decimal) -> str:
    return f"{ratio * 100:.0f}%"
