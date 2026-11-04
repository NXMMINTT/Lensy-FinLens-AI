from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from app.models import Business
from app.models.enums import IncomeExpenseType, TransactionSource, TransactionStatus
from app.schemas.gemini import GeminiParseResult, ParsedIntent, ParsedTransaction, ParsedTransactionType
from app.services import transaction_service


def _parse_result(*items: ParsedTransaction) -> GeminiParseResult:
    return GeminiParseResult(intent=ParsedIntent.RECORD_TRANSACTIONS, transactions=list(items))


def _txn(
    type_: ParsedTransactionType,
    amount: str,
    category_hint: str = "ขายหน้าร้าน",
    txn_date: date = date(2026, 10, 15),
    confidence: str = "0.95",
) -> ParsedTransaction:
    return ParsedTransaction(
        type=type_,
        amount=Decimal(amount),
        category_hint=category_hint,
        description=category_hint,
        txn_date=txn_date,
        is_personal=False,
        confidence=Decimal(confidence),
    )


def test_create_pending_transactions_creates_pending_rows(db_session: Session, business: Business):
    parsed = _parse_result(
        _txn(ParsedTransactionType.INCOME, "3500"),
        _txn(ParsedTransactionType.EXPENSE, "1200", category_hint="ค่าวัตถุดิบ"),
    )
    created = transaction_service.create_pending_transactions(
        db_session, business, parsed, source=TransactionSource.TEXT, raw_input="ขายของได้ 3,500 ซื้อของวันนี้ 1,200"
    )

    assert len(created) == 2
    assert all(t.status == TransactionStatus.PENDING for t in created)
    assert created[0].amount == Decimal("3500")
    assert created[1].amount == Decimal("1200")


def test_create_pending_transactions_reuses_category(db_session: Session, business: Business):
    parsed = _parse_result(_txn(ParsedTransactionType.INCOME, "100"), _txn(ParsedTransactionType.INCOME, "200"))
    created = transaction_service.create_pending_transactions(
        db_session, business, parsed, source=TransactionSource.TEXT, raw_input="x"
    )
    assert created[0].category_id == created[1].category_id


def test_confirm_transaction_sets_confirmed(db_session: Session, business: Business):
    parsed = _parse_result(_txn(ParsedTransactionType.INCOME, "500"))
    [created] = transaction_service.create_pending_transactions(
        db_session, business, parsed, source=TransactionSource.TEXT, raw_input="x"
    )
    confirmed = transaction_service.confirm_transaction(db_session, created.id, business.id)
    assert confirmed.status == TransactionStatus.CONFIRMED


def test_cancel_transaction_sets_cancelled(db_session: Session, business: Business):
    parsed = _parse_result(_txn(ParsedTransactionType.EXPENSE, "500"))
    [created] = transaction_service.create_pending_transactions(
        db_session, business, parsed, source=TransactionSource.TEXT, raw_input="x"
    )
    cancelled = transaction_service.cancel_transaction(db_session, created.id, business.id)
    assert cancelled.status == TransactionStatus.CANCELLED


def test_confirm_transaction_wrong_business_raises(db_session: Session, business: Business):
    parsed = _parse_result(_txn(ParsedTransactionType.INCOME, "500"))
    [created] = transaction_service.create_pending_transactions(
        db_session, business, parsed, source=TransactionSource.TEXT, raw_input="x"
    )
    with pytest.raises(transaction_service.TransactionNotFoundError):
        transaction_service.confirm_transaction(db_session, created.id, business.id + 999)


def test_get_owned_transaction_missing_raises(db_session: Session, business: Business):
    with pytest.raises(transaction_service.TransactionNotFoundError):
        transaction_service.get_owned_transaction(db_session, 999999, business.id)


def test_current_year_confirmed_income_sums_only_confirmed(db_session: Session, business: Business):
    parsed = _parse_result(
        _txn(ParsedTransactionType.INCOME, "1000", txn_date=date(2026, 1, 1)),
        _txn(ParsedTransactionType.INCOME, "2000", txn_date=date(2026, 6, 1)),
        _txn(ParsedTransactionType.EXPENSE, "500", txn_date=date(2026, 6, 1)),
    )
    created = transaction_service.create_pending_transactions(
        db_session, business, parsed, source=TransactionSource.TEXT, raw_input="x"
    )
    # Only confirm the first two (both income); leave the expense pending.
    transaction_service.confirm_transaction(db_session, created[0].id, business.id)
    transaction_service.confirm_transaction(db_session, created[1].id, business.id)

    total = transaction_service.annual_confirmed_income(db_session, business.id, 2026)
    assert total == Decimal("3000")


def test_day_totals_splits_income_and_expense(db_session: Session, business: Business):
    day = date(2026, 10, 15)
    parsed = _parse_result(
        _txn(ParsedTransactionType.INCOME, "3500", txn_date=day),
        _txn(ParsedTransactionType.EXPENSE, "1200", txn_date=day, category_hint="ค่าวัตถุดิบ"),
    )
    created = transaction_service.create_pending_transactions(
        db_session, business, parsed, source=TransactionSource.TEXT, raw_input="x"
    )
    for txn in created:
        transaction_service.confirm_transaction(db_session, txn.id, business.id)

    income_total, expense_total = transaction_service.day_totals(db_session, business.id, day)
    assert income_total == Decimal("3500")
    assert expense_total == Decimal("1200")


def test_day_totals_ignores_other_days(db_session: Session, business: Business):
    parsed = _parse_result(_txn(ParsedTransactionType.INCOME, "999", txn_date=date(2026, 1, 1)))
    created = transaction_service.create_pending_transactions(
        db_session, business, parsed, source=TransactionSource.TEXT, raw_input="x"
    )
    transaction_service.confirm_transaction(db_session, created[0].id, business.id)

    income_total, expense_total = transaction_service.day_totals(db_session, business.id, date(2026, 10, 15))
    assert income_total == Decimal("0")
    assert expense_total == Decimal("0")
