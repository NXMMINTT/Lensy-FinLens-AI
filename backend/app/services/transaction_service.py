"""Turns Gemini-parsed input into pending transactions, and resolves them
on user confirmation/cancellation. No tax math happens here — see
app/tax_engine for that.
"""

from datetime import date
from decimal import Decimal

from sqlalchemy import extract, select
from sqlalchemy.orm import Session

from app.models import Business, Category, Transaction
from app.models.enums import IncomeExpenseType, TransactionSource, TransactionStatus
from app.schemas.gemini import GeminiParseResult
from app.services import inventory_service


class TransactionNotFoundError(Exception):
    pass


def _get_or_create_category(db: Session, business_id: int, name_th: str, type_: IncomeExpenseType) -> Category:
    existing = db.execute(
        select(Category).where(
            Category.name_th == name_th,
            Category.type == type_,
            (Category.business_id == business_id) | (Category.business_id.is_(None)),
        )
    ).scalars().first()
    if existing is not None:
        return existing

    category = Category(business_id=business_id, name_th=name_th, type=type_)
    db.add(category)
    db.flush()
    return category


def create_pending_transactions(
    db: Session,
    business: Business,
    parsed: GeminiParseResult,
    source: TransactionSource,
    raw_input: str | None,
) -> list[Transaction]:
    created: list[Transaction] = []
    for item in parsed.transactions:
        type_ = IncomeExpenseType(item.type.value)
        category = _get_or_create_category(db, business.id, item.category_hint, type_)
        product = (
            inventory_service.get_or_create_product(db, business.id, item.product_name)
            if item.product_name and item.quantity is not None
            else None
        )
        txn = Transaction(
            business_id=business.id,
            type=type_,
            amount=item.amount,
            category_id=category.id,
            description=item.description,
            txn_date=item.txn_date,
            is_personal=item.is_personal,
            product_id=product.id if product else None,
            quantity=item.quantity if product else None,
            source=source,
            raw_input=raw_input,
            ai_confidence=item.confidence,
            status=TransactionStatus.PENDING,
        )
        db.add(txn)
        created.append(txn)
    db.flush()
    return created


def create_manual_transaction(
    db: Session,
    business_id: int,
    *,
    type_: IncomeExpenseType,
    amount: Decimal,
    description: str | None,
    txn_date: date,
    category_name: str | None,
    product_name: str | None,
    quantity: Decimal | None,
) -> Transaction:
    """A transaction the owner typed on the web. There's no AI reading to double-check,
    so it is confirmed (and moves stock) right away instead of waiting as pending."""
    category = _get_or_create_category(db, business_id, category_name, type_) if category_name else None
    product = (
        inventory_service.get_or_create_product(db, business_id, product_name)
        if product_name and quantity is not None
        else None
    )
    txn = Transaction(
        business_id=business_id,
        type=type_,
        amount=amount,
        category_id=category.id if category else None,
        description=description,
        txn_date=txn_date,
        product_id=product.id if product else None,
        quantity=quantity if product else None,
        source=TransactionSource.WEB,
        status=TransactionStatus.CONFIRMED,
    )
    db.add(txn)
    db.flush()
    inventory_service.apply_stock_movement(db, txn)
    db.refresh(txn)
    return txn


def confirm_transaction(db: Session, transaction_id: int, business_id: int) -> Transaction:
    txn = get_owned_transaction(db, transaction_id, business_id)
    txn.status = TransactionStatus.CONFIRMED
    db.flush()
    inventory_service.apply_stock_movement(db, txn)
    return txn


def cancel_transaction(db: Session, transaction_id: int, business_id: int) -> Transaction:
    txn = get_owned_transaction(db, transaction_id, business_id)
    txn.status = TransactionStatus.CANCELLED
    db.flush()
    return txn


class TransactionNotEditableError(Exception):
    pass


def update_pending_transaction(
    db: Session,
    transaction_id: int,
    business_id: int,
    *,
    type_: IncomeExpenseType,
    amount: Decimal,
    description: str | None,
    txn_date: date,
    product_name: str | None,
    quantity: Decimal | None,
) -> Transaction:
    """Edits a transaction before it's confirmed. Confirmed ones have already
    moved stock (inventory_service.apply_stock_movement), so they stay read-only."""
    txn = get_owned_transaction(db, transaction_id, business_id)
    if txn.status != TransactionStatus.PENDING:
        raise TransactionNotEditableError(f"transaction {transaction_id} is {txn.status.value}")
    txn.type = type_
    txn.amount = amount
    txn.description = description
    txn.txn_date = txn_date
    product = (
        inventory_service.get_or_create_product(db, business_id, product_name)
        if product_name and quantity is not None
        else None
    )
    txn.product_id = product.id if product else None
    txn.quantity = quantity if product else None
    db.flush()
    db.refresh(txn)
    return txn


def get_owned_transaction(db: Session, transaction_id: int, business_id: int) -> Transaction:
    txn = db.get(Transaction, transaction_id)
    if txn is None or txn.business_id != business_id:
        raise TransactionNotFoundError(f"transaction {transaction_id} not found for business {business_id}")
    return txn


def annual_confirmed_income(db: Session, business_id: int, year: int) -> Decimal:
    total = db.execute(
        select(Transaction.amount).where(
            Transaction.business_id == business_id,
            Transaction.type == IncomeExpenseType.INCOME,
            Transaction.status == TransactionStatus.CONFIRMED,
            extract("year", Transaction.txn_date) == year,
        )
    ).scalars().all()
    return sum(total, Decimal("0"))


def current_year_confirmed_income(db: Session, business_id: int) -> Decimal:
    return annual_confirmed_income(db, business_id, date.today().year)


def day_totals(db: Session, business_id: int, day: date) -> tuple[Decimal, Decimal]:
    """Returns (income_total, expense_total) for confirmed transactions on `day`."""
    rows = db.execute(
        select(Transaction.type, Transaction.amount).where(
            Transaction.business_id == business_id,
            Transaction.status == TransactionStatus.CONFIRMED,
            Transaction.txn_date == day,
        )
    ).all()
    income_total = sum((amount for type_, amount in rows if type_ == IncomeExpenseType.INCOME), Decimal("0"))
    expense_total = sum((amount for type_, amount in rows if type_ == IncomeExpenseType.EXPENSE), Decimal("0"))
    return income_total, expense_total
