from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Business
from app.models.enums import TransactionSource, TransactionStatus
from app.schemas.gemini import GeminiParseResult, ParsedIntent, ParsedTransaction, ParsedTransactionType
from app.services import inventory_service, transaction_service


def _create(
    db: Session,
    business: Business,
    type_: ParsedTransactionType,
    amount: str,
    product_name: str | None,
    quantity: str | None,
    is_personal: bool = False,
):
    parsed = GeminiParseResult(
        intent=ParsedIntent.RECORD_TRANSACTIONS,
        transactions=[
            ParsedTransaction(
                type=type_,
                amount=Decimal(amount),
                category_hint="ขายออนไลน์" if type_ == ParsedTransactionType.INCOME else "ค่าซื้อสินค้า",
                description="x",
                txn_date=date(2026, 10, 15),
                is_personal=is_personal,
                product_name=product_name,
                quantity=Decimal(quantity) if quantity is not None else None,
                confidence=Decimal("0.9"),
            )
        ],
    )
    [txn] = transaction_service.create_pending_transactions(
        db, business, parsed, source=TransactionSource.TEXT, raw_input="x"
    )
    return txn


def test_pending_transaction_links_product_without_moving_stock(db_session: Session, business: Business):
    txn = _create(db_session, business, ParsedTransactionType.INCOME, "500", "น้ำพริกเผา", "5")

    assert txn.status == TransactionStatus.PENDING
    assert txn.product.name == "น้ำพริกเผา"
    assert txn.quantity == Decimal("5")
    assert txn.product.stock_qty == Decimal("0")


def test_purchase_adds_stock_and_sets_unit_cost(db_session: Session, business: Business):
    txn = _create(db_session, business, ParsedTransactionType.EXPENSE, "1200", "น้ำพริกเผา", "20")
    transaction_service.confirm_transaction(db_session, txn.id, business.id)

    assert txn.product.stock_qty == Decimal("20")
    assert txn.product.unit_cost == Decimal("60.00")


def test_sale_deducts_stock_from_same_product(db_session: Session, business: Business):
    purchase = _create(db_session, business, ParsedTransactionType.EXPENSE, "1200", "น้ำพริกเผา", "20")
    transaction_service.confirm_transaction(db_session, purchase.id, business.id)

    # Case-insensitive match reuses the existing product row.
    sale = _create(db_session, business, ParsedTransactionType.INCOME, "500", " น้ำพริกเผา ", "5")
    assert sale.product_id == purchase.product_id
    transaction_service.confirm_transaction(db_session, sale.id, business.id)

    assert sale.product.stock_qty == Decimal("15")
    assert sale.product.unit_cost == Decimal("60.00")


def test_cancelled_sale_does_not_move_stock(db_session: Session, business: Business):
    sale = _create(db_session, business, ParsedTransactionType.INCOME, "500", "กล้วยตาก", "5")
    transaction_service.cancel_transaction(db_session, sale.id, business.id)

    assert sale.product.stock_qty == Decimal("0")


def test_personal_and_non_product_transactions_do_not_move_stock(db_session: Session, business: Business):
    personal = _create(db_session, business, ParsedTransactionType.INCOME, "500", "กล้วยตาก", "5", is_personal=True)
    transaction_service.confirm_transaction(db_session, personal.id, business.id)
    assert personal.product.stock_qty == Decimal("0")

    rent = _create(db_session, business, ParsedTransactionType.EXPENSE, "5000", None, None)
    transaction_service.confirm_transaction(db_session, rent.id, business.id)
    assert rent.product_id is None


def test_list_product_names(db_session: Session, business: Business):
    inventory_service.get_or_create_product(db_session, business.id, "สบู่สมุนไพร")
    inventory_service.get_or_create_product(db_session, business.id, "กล้วยตาก")

    assert inventory_service.list_product_names(db_session, business.id) == ["กล้วยตาก", "สบู่สมุนไพร"]
