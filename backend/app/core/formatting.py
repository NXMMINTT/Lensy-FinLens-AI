"""Thai-locale display formatting (currency, dates) shared across bot
replies and Flex Messages. Not used for API JSON, which keeps amounts as
plain decimal strings (see project brief API contract notes).
"""

from datetime import date
from decimal import Decimal

_THAI_MONTHS = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
]


def format_thb(amount: Decimal) -> str:
    return f"฿{amount:,.2f}"


def format_thai_date(d: date) -> str:
    return f"{d.day} {_THAI_MONTHS[d.month - 1]} {d.year + 543}"
