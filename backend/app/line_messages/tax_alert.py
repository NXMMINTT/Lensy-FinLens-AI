"""Flex card for the VAT ceiling alert (แจ้งเตือนภาษี).

Zone colors follow the card design: <60% green, 60–89% yellow, 90%+ red.
The threshold itself comes from config/tax_rules.yaml.
"""

from decimal import Decimal

from linebot.v3.messaging import FlexMessage

from app.core.settings import settings
from app.line_messages.flex_style import (
    GREEN, GREY, NAVY, RED, TAX_YELLOW_BANNER, YELLOW,
    asset, baht_whole, footer, glyph_box, hero, pill, postback, progress_bar, to_flex_message,
)
from app.tax_engine.rules_loader import load_tax_rules

_ZONES = {
    "green": {**GREEN, "name": "โซนเขียว", "button": GREEN["main"], "banner": asset("banner-tax-green.jpg"),
              "tips": ["จดรายรับทุกวัน ยอดจะได้ไม่ตกหล่น", "เก็บใบเสร็จค่าวัตถุดิบให้ครบ", "เช็กยอดสะสมทุกต้นเดือน"]},
    "yellow": {**YELLOW, "name": "โซนเหลือง", "button": "#D18E00", "banner": TAX_YELLOW_BANNER,
               "tips": ["เก็บใบเสร็จค่าวัตถุดิบให้ครบ", "เช็กยอดขายทุกแพลตฟอร์มให้ตรง",
                        "ถ้าเกินเพดาน จด VAT ภายใน 30 วัน"]},
    "red": {**RED, "name": "โซนแดง", "button": RED["main"], "banner": asset("banner-tax-red.jpg"),
            "tips": ["เตรียมเอกสารสำหรับจด VAT ให้พร้อม", "ถ้าเกินเพดาน ต้องจด VAT ภายใน 30 วัน",
                     "ปรึกษานักบัญชีเรื่องการออกใบกำกับภาษี"]},
}


def tax_zone(percent: int) -> str:
    if percent < 60:
        return "green"
    if percent < 90:
        return "yellow"
    return "red"


def _tip_row(text: str, z: dict) -> dict:
    return {
        "type": "box", "layout": "horizontal", "alignItems": "center", "spacing": "md",
        "backgroundColor": z["tint"] + "99", "cornerRadius": "14px",
        "paddingAll": "10px", "paddingStart": "12px", "paddingEnd": "12px",
        "contents": [glyph_box("✓", z["main"]),
                     {"type": "text", "text": text, "size": "sm", "color": NAVY, "wrap": True, "flex": 1}],
    }


def _detail_action() -> dict:
    if settings.liff_id:
        return {"type": "uri", "label": "ดูรายละเอียดภาษี", "uri": f"https://liff.line.me/{settings.liff_id}/dashboard"}
    return postback("ดูรายละเอียดภาษี", "action=tax_detail", "ดูรายละเอียดภาษี")


def build_tax_alert_flex(annual_income: Decimal, threshold: Decimal | None = None) -> FlexMessage:
    ceiling = threshold if threshold is not None else load_tax_rules().vat.annual_threshold
    percent = round(annual_income / ceiling * 100)
    zone = tax_zone(percent)
    z = _ZONES[zone]
    over = annual_income > ceiling
    remain = f"เกินมาแล้ว {baht_whole(annual_income - ceiling)}" if over else f"เหลืออีก {baht_whole(ceiling - annual_income)}"

    body = [
        {"type": "box", "layout": "horizontal", "alignItems": "center", "contents": [
            {"type": "text", "text": "ยอดขายสะสมปีนี้", "size": "sm", "color": GREY, "flex": 1},
            pill(f"{percent}%", z["tint"], z["dark"]),
        ]},
        {"type": "text", "text": baht_whole(annual_income), "size": "3xl", "weight": "bold", "color": NAVY,
         "margin": "sm", "adjustMode": "shrink-to-fit"},
        {**progress_bar(percent, z["track"], z["main"]), "margin": "md"},
        {"type": "box", "layout": "horizontal", "margin": "sm", "contents": [
            {"type": "text", "text": f"{percent}% ของเพดาน {baht_whole(ceiling)}", "size": "xxs", "color": GREY, "flex": 1},
            {"type": "text", "text": remain, "size": "xxs", "weight": "bold", "color": z["dark"], "flex": 0},
        ]},
        {"type": "text", "text": "สิ่งที่ควรเตรียมไว้ค่ะ", "size": "md", "weight": "bold", "color": NAVY, "margin": "xl"},
        {"type": "box", "layout": "vertical", "margin": "md", "spacing": "sm",
         "contents": [_tip_row(tip, z) for tip in z["tips"]]},
    ]
    bubble = {
        "type": "bubble", "size": "mega", "hero": hero(z["banner"]),
        "body": {"type": "box", "layout": "vertical", "paddingAll": "20px", "paddingBottom": "4px", "contents": body},
        "footer": footer(_detail_action(), z["button"],
                         postback("เตือนอีกครั้งเดือนหน้า", "action=tax_snooze", "เตือนอีกครั้งเดือนหน้า")),
    }
    return to_flex_message(f"แจ้งเตือนภาษี · {z['name']} ({percent}% ของเพดาน VAT)", bubble)
