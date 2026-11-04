"""Flex card for the yearly overview (สรุปผลประจำปี, blue theme)."""

from dataclasses import dataclass
from decimal import Decimal

from linebot.v3.messaging import FlexMessage

from app.core.settings import settings
from app.line_messages.flex_style import (
    BLUE, GREEN, GREY, NAVY, RED,
    asset, baht_whole, footer, glyph_box, hero, pill, postback, progress_bar, to_flex_message,
)


@dataclass
class ProductShare:
    name: str
    share_percent: Decimal


def _money_row(label: str, amount: Decimal, c: dict, glyph: str) -> dict:
    return {
        "type": "box", "layout": "horizontal", "alignItems": "center", "spacing": "md",
        "backgroundColor": c["tint"] + "99", "cornerRadius": "14px",
        "paddingAll": "10px", "paddingStart": "12px", "paddingEnd": "14px",
        "contents": [
            glyph_box(glyph, c["main"], "30px", "9px"),
            {"type": "text", "text": label, "size": "sm", "color": NAVY, "flex": 1},
            {"type": "text", "text": baht_whole(amount), "size": "md", "weight": "bold", "color": c["main"], "flex": 0},
        ],
    }


def _product_row(rank: int, p: ProductShare) -> dict:
    return {
        "type": "box", "layout": "vertical", "spacing": "sm", "contents": [
            {"type": "box", "layout": "horizontal", "alignItems": "center", "spacing": "md", "contents": [
                glyph_box(str(rank), BLUE["main"] if rank == 1 else "#93B4F6", "24px", "9px"),
                {"type": "text", "text": p.name, "size": "sm", "color": NAVY, "flex": 1, "wrap": True, "maxLines": 1},
                {"type": "text", "text": f"{p.share_percent:.0f}%", "size": "sm", "weight": "bold", "color": NAVY,
                 "flex": 0},
            ]},
            progress_bar(float(p.share_percent), BLUE["track"], BLUE["main"], height=8),
        ],
    }


def _report_action() -> dict:
    if settings.liff_id:
        return {"type": "uri", "label": "ดูรายงานฉบับเต็ม", "uri": f"https://liff.line.me/{settings.liff_id}/dashboard"}
    return postback("ดูรายงานฉบับเต็ม", "action=year_report", "ดูรายงานฉบับเต็ม")


def build_year_summary_flex(
    year: int,
    income_total: Decimal,
    expense_total: Decimal,
    top_products: list[ProductShare] | None = None,
    channel: str | None = None,
) -> FlexMessage:
    """`year` is the Gregorian year; the card shows the Thai (B.E.) year."""
    profit = income_total - expense_total
    margin = round(profit / income_total * 100) if income_total > 0 else 0
    be_year = year + 543

    top_row: list[dict] = [pill(f"ปี {be_year}", BLUE["tint"], BLUE["dark"]), {"type": "filler"}]
    if channel:
        top_row.append(pill(channel, "#F1F3F7", "#5B6478"))

    body: list[dict] = [
        {"type": "box", "layout": "horizontal", "alignItems": "center", "spacing": "sm", "contents": top_row},
        {"type": "text", "text": "กำไรสุทธิ", "size": "sm", "color": GREY, "margin": "lg"},
        {"type": "text", "text": baht_whole(profit), "size": "3xl", "weight": "bold", "adjustMode": "shrink-to-fit",
         "color": BLUE["main"] if profit >= 0 else RED["main"]},
        {"type": "text", "text": f"อัตรากำไร {margin}% ของรายรับ", "size": "xxs", "color": GREY},
        {"type": "box", "layout": "vertical", "margin": "lg", "spacing": "sm", "contents": [
            _money_row("รายรับ", income_total, GREEN, "↑"),
            _money_row("รายจ่าย", expense_total, RED, "↓"),
        ]},
    ]
    products = (top_products or [])[:3]
    if products:
        body += [
            {"type": "text", "text": "สินค้าขายดี", "size": "md", "weight": "bold", "color": NAVY, "margin": "xl"},
            {"type": "box", "layout": "vertical", "margin": "md", "spacing": "lg",
             "contents": [_product_row(i + 1, p) for i, p in enumerate(products)]},
        ]

    bubble = {
        "type": "bubble", "size": "mega", "hero": hero(asset("banner-summary-blue.jpg")),
        "body": {"type": "box", "layout": "vertical", "paddingAll": "20px", "paddingBottom": "4px", "contents": body},
        "footer": footer(_report_action(), BLUE["main"],
                         postback("ดูสรุปรายเดือน", "action=month_summary", "ดูสรุปรายเดือน")),
    }
    return to_flex_message(f"สรุปปี {be_year}: กำไรสุทธิ {baht_whole(profit)}", bubble)
