"""Flex Message for daily/monthly summary, styled to match the U-Fox design
with colored stat cards and category breakdown.
"""

from decimal import Decimal

from linebot.v3.messaging import (
    FlexBox,
    FlexBubble,
    FlexMessage,
    FlexSeparator,
    FlexText,
)

from app.core.formatting import format_thb


def build_summary_flex(
    income_total: Decimal,
    expense_total: Decimal,
    period_label: str = "วันนี้",
    category_breakdown: list[tuple[str, Decimal]] | None = None,
) -> FlexMessage:
    net = income_total - expense_total

    header = FlexBox(
        layout="vertical",
        background_color="#1A73E8",
        padding_all="16px",
        contents=[
            FlexText(
                text=f"📊 สรุปภาพรวม{period_label}",
                color="#FFFFFF",
                size="lg",
                weight="bold",
            ),
        ],
    )

    stat_cards: list = [
        _stat_card("💵 รายรับ", income_total, "#E8F5E9", "#1DB446"),
        _stat_card("💸 รายจ่าย", expense_total, "#FFEBEE", "#E8547E"),
        _stat_card("📈 กำไรสุทธิ", net, "#E3F2FD", "#1A73E8"),
    ]

    body_contents: list = [
        FlexBox(layout="vertical", spacing="sm", contents=stat_cards),
    ]

    if category_breakdown:
        body_contents.append(FlexSeparator(margin="lg"))
        body_contents.append(
            FlexText(
                text="💰 รายจ่ายตามหมวดหมู่",
                size="sm",
                weight="bold",
                color="#333333",
                margin="lg",
            )
        )
        total_expense = sum(amt for _, amt in category_breakdown) or Decimal("1")
        for cat_name, cat_amount in category_breakdown[:5]:
            pct = int(cat_amount / total_expense * 100) if total_expense else 0
            body_contents.append(
                _category_row(cat_name, cat_amount, pct)
            )

    body = FlexBox(
        layout="vertical",
        padding_all="16px",
        spacing="md",
        contents=body_contents,
    )

    bubble = FlexBubble(header=header, body=body)
    return FlexMessage(alt_text=f"สรุปภาพรวม{period_label}", contents=bubble)


def _stat_card(label: str, amount: Decimal, bg_color: str, text_color: str) -> FlexBox:
    return FlexBox(
        layout="horizontal",
        background_color=bg_color,
        corner_radius="12px",
        padding_all="12px",
        contents=[
            FlexText(text=label, size="sm", color="#666666", flex=4),
            FlexText(
                text=format_thb(amount),
                size="md",
                weight="bold",
                color=text_color,
                align="end",
                flex=6,
            ),
        ],
    )


def _category_row(name: str, amount: Decimal, pct: int) -> FlexBox:
    bar_width = max(pct, 5)
    return FlexBox(
        layout="horizontal",
        margin="sm",
        contents=[
            FlexText(text=name, size="xs", color="#555555", flex=4),
            FlexText(
                text=format_thb(amount),
                size="xs",
                color="#333333",
                weight="bold",
                align="end",
                flex=4,
            ),
            FlexText(
                text=f"{pct}%",
                size="xs",
                color="#888888",
                align="end",
                flex=2,
            ),
        ],
    )
