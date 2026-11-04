"""Structured-output contract for Gemini transaction parsing.

Gemini only extracts data into this shape — it must never compute tax,
totals, or running balances (that stays in app/tax_engine and app/analytics).
"""

from datetime import date
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field


class ParsedIntent(str, Enum):
    RECORD_TRANSACTIONS = "record_transactions"
    TAX_QUESTION = "tax_question"
    SUMMARY_REQUEST = "summary_request"
    OTHER = "other"


class ParsedTransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class ParsedTransaction(BaseModel):
    type: ParsedTransactionType
    amount: Decimal
    category_hint: str
    description: str
    txn_date: date
    is_personal: bool = False
    product_name: str | None = None
    quantity: Decimal | None = None
    confidence: Decimal = Field(ge=0, le=1)


class GeminiParseResult(BaseModel):
    intent: ParsedIntent
    transactions: list[ParsedTransaction] = Field(default_factory=list)
    clarification_question: str | None = None
