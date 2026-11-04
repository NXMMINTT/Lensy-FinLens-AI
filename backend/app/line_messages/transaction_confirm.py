"""Flex Message for confirming AI-parsed transactions (U-Fox banner design).

Every detail row is tappable: the date row opens LINE's date picker
(action=edit_date), the other rows start the edit flow (LIFF form when
LIFF_ID is set, otherwise the chat `action=edit` postback).
"""

from decimal import Decimal

from linebot.v3.messaging import FlexMessage

from app.core.formatting import format_thai_date, format_thb
from app.core.settings import settings
from app.line_messages.flex_style import GREEN, GREY, NAVY, RED, asset, footer, hero, pill, postback, to_flex_message
from app.locales import th
from app.models import Transaction
from app.models.enums import IncomeExpenseType

LOW_CONFIDENCE_THRESHOLD = Decimal("0.70")

_THEMES = {
    IncomeExpenseType.INCOME: {**GREEN, "key": "income", "sign": "+", "label": th.INCOME_LABEL},
    IncomeExpenseType.EXPENSE: {**RED, "key": "expense", "sign": "-", "label": th.EXPENSE_LABEL},
}


def _edit_action(txn: Transaction) -> dict:
    if settings.liff_id:
        return {
            "type": "uri",
            "label": th.TRANSACTION_EDIT_BUTTON,
            "uri": f"https://liff.line.me/{settings.liff_id}/transactions?edit={txn.id}",
        }
    return postback(th.TRANSACTION_EDIT_BUTTON, f"action=edit&id={txn.id}", th.TRANSACTION_EDIT_BUTTON)


def _date_action(txn: Transaction) -> dict:
    return {
        "type": "datetimepicker",
        "label": "date",
        "data": f"action=edit_date&id={txn.id}",
        "mode": "date",
        "initial": txn.txn_date.isoformat(),
    }


def _row(icon: str, label: str, value: str, action: dict, t: dict) -> dict:
    return {
        "type": "box", "layout": "horizontal", "alignItems": "center", "spacing": "md",
        "backgroundColor": t["tint"] + "99", "cornerRadius": "14px",
        "paddingAll": "10px", "paddingStart": "12px", "paddingEnd": "12px", "action": action,
        "contents": [
            {"type": "box", "layout": "vertical", "flex": 0, "width": "34px", "height": "34px", "cornerRadius": "10px",
             "backgroundColor": t["main"], "justifyContent": "center", "alignItems": "center",
             "contents": [{"type": "image", "url": asset(f"icon-{icon}-white.png"), "size": "18px", "aspectRatio": "1:1"}]},
            {"type": "box", "layout": "vertical", "flex": 1, "contents": [
                {"type": "text", "text": label, "size": "xxs", "color": GREY},
                {"type": "text", "text": value, "size": "md", "weight": "bold", "color": NAVY, "wrap": True, "maxLines": 2},
            ]},
            {"type": "box", "layout": "vertical", "flex": 0, "backgroundColor": "#FFFFFF", "cornerRadius": "10px",
             "paddingTop": "4px", "paddingBottom": "4px", "paddingStart": "10px", "paddingEnd": "10px",
             "contents": [{"type": "text", "text": th.TRANSACTION_EDIT_BUTTON, "size": "xs", "weight": "bold",
                           "color": t["dark"]}]},
        ],
    }


def build_transaction_bubble(txn: Transaction) -> dict:
    t = _THEMES[txn.type]
    edit = _edit_action(txn)

    body: list[dict] = [
        {"type": "box", "layout": "horizontal", "alignItems": "center", "contents": [
            pill(t["label"], t["tint"], t["dark"]),
            {"type": "text", "text": "ตรวจสอบก่อนบันทึก", "size": "xs", "color": GREY, "align": "end"},
        ]},
    ]
    if txn.ai_confidence is not None and txn.ai_confidence < LOW_CONFIDENCE_THRESHOLD:
        body.append({"type": "text", "text": f"⚠ {th.LOW_CONFIDENCE_BADGE}", "size": "xs", "weight": "bold",
                     "color": "#E09000", "margin": "md", "wrap": True})

    body.append({"type": "text", "text": f"{t['sign']}{format_thb(txn.amount)}", "size": "3xl", "weight": "bold",
                 "color": t["main"], "margin": "md", "adjustMode": "shrink-to-fit", "action": edit})
    body.append({"type": "box", "layout": "horizontal", "alignItems": "center", "margin": "sm", "spacing": "md",
                 "contents": [
                     {"type": "text", "text": f"“{txn.raw_input}”" if txn.raw_input else " ", "size": "xxs",
                      "color": GREY, "flex": 1, "wrap": True, "maxLines": 2},
                     {"type": "box", "layout": "horizontal", "flex": 0, "spacing": "xs", "alignItems": "center",
                      "backgroundColor": t["tint"], "cornerRadius": "14px", "paddingTop": "5px",
                      "paddingBottom": "5px", "paddingStart": "10px", "paddingEnd": "12px", "action": edit,
                      "contents": [
                          {"type": "image", "url": asset(f"icon-edit-{t['key']}.png"), "size": "14px",
                           "aspectRatio": "1:1", "flex": 0},
                          {"type": "text", "text": "แก้ยอด", "size": "xs", "weight": "bold", "color": t["dark"],
                           "flex": 0},
                      ]},
                 ]})

    rows = [
        _row("calendar", "วันที่", format_thai_date(txn.txn_date), _date_action(txn), t),
        _row("category", "หมวดหมู่", txn.category.name_th if txn.category else "ไม่ระบุ", edit, t),
        _row("note", "รายการ", txn.description or "-", edit, t),
    ]
    if txn.product is not None:
        qty = f"{txn.quantity.normalize():f} {txn.product.unit}" if txn.quantity else "-"
        rows.append(_row("note", "สินค้า", f"{txn.product.name} ({qty})", edit, t))
    body.append({"type": "box", "layout": "vertical", "margin": "lg", "spacing": "sm", "contents": rows})

    return {
        "type": "bubble", "size": "mega",
        "hero": hero(asset(f"banner-{t['key']}.jpg")),
        "body": {"type": "box", "layout": "vertical", "paddingAll": "20px", "paddingBottom": "4px", "contents": body},
        "footer": footer(
            postback(f"✓ {th.TRANSACTION_CONFIRM_BUTTON}บันทึก", f"action=confirm&id={txn.id}",
                     th.TRANSACTION_CONFIRM_BUTTON),
            t["main"],
            postback(th.TRANSACTION_CANCEL_BUTTON, f"action=cancel&id={txn.id}", th.TRANSACTION_CANCEL_BUTTON),
        ),
    }


def build_transaction_confirmation_message(transactions: list[Transaction]) -> FlexMessage:
    carousel = {"type": "carousel", "contents": [build_transaction_bubble(txn) for txn in transactions]}
    return to_flex_message(f"พบ {len(transactions)} รายการ กรุณายืนยัน", carousel)
