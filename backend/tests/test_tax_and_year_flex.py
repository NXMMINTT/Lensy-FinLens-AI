from decimal import Decimal

import pytest

from app.line_messages.tax_alert import build_tax_alert_flex, tax_zone
from app.line_messages.year_summary import ProductShare, build_year_summary_flex

THRESHOLD = Decimal("1800000")


@pytest.mark.parametrize(
    ("percent", "zone"), [(0, "green"), (59, "green"), (60, "yellow"), (89, "yellow"), (90, "red"), (110, "red")]
)
def test_tax_zone_boundaries(percent, zone):
    assert tax_zone(percent) == zone


@pytest.mark.parametrize(
    ("income", "zone_name", "banner"),
    [
        ("720000", "โซนเขียว", "banner-tax-green.jpg"),
        ("1262000", "โซนเหลือง", "banner-tax-yellow.jpg"),
        ("1890000", "โซนแดง", "banner-tax-red.jpg"),
    ],
)
def test_tax_alert_picks_zone_and_banner(income, zone_name, banner):
    message = build_tax_alert_flex(Decimal(income), THRESHOLD)
    assert zone_name in message.alt_text
    assert message.contents.hero.url.endswith(banner)


def _texts(box) -> list[str]:
    out = []
    for c in getattr(box, "contents", None) or []:
        if hasattr(c, "text") and c.text:
            out.append(c.text)
        out.extend(_texts(c))
    return out


def test_tax_alert_shows_remaining_or_overage():
    under = _texts(build_tax_alert_flex(Decimal("1262000"), THRESHOLD).contents.body)
    over = _texts(build_tax_alert_flex(Decimal("1890000"), THRESHOLD).contents.body)
    assert "เหลืออีก ฿538,000" in under
    assert "เกินมาแล้ว ฿90,000" in over


def test_tax_alert_bar_never_overflows():
    body = build_tax_alert_flex(Decimal("2500000"), THRESHOLD).contents.body
    bar = body.contents[2]
    assert bar.contents[0].width == "100%"


def test_year_summary_shows_profit_in_thai_year():
    message = build_year_summary_flex(
        2026, Decimal("1262000"), Decimal("748500"), [ProductShare("น้ำพริกตาแดง", Decimal("62"))]
    )
    texts = _texts(message.contents.body)
    assert message.alt_text == "สรุปปี 2569: กำไรสุทธิ ฿513,500"
    assert "฿513,500" in texts
    assert "น้ำพริกตาแดง" in texts
    assert "62%" in texts


def test_year_summary_loss_is_red_and_negative():
    message = build_year_summary_flex(2026, Decimal("100"), Decimal("250"))
    profit = message.contents.body.contents[2]
    assert profit.text == "-฿150"
    assert profit.color == "#E8335A"
