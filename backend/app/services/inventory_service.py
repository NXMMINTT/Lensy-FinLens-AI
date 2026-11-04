"""Product lookup and stock movements. Stock only moves when a transaction
is confirmed: a sale deducts stock, a purchase adds stock and records the
latest unit cost.
"""

from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Product, Transaction
from app.models.enums import IncomeExpenseType


def list_product_names(db: Session, business_id: int) -> list[str]:
    return list(
        db.execute(select(Product.name).where(Product.business_id == business_id).order_by(Product.name))
        .scalars()
        .all()
    )


class ProductNotFoundError(Exception):
    pass


class ProductNameTakenError(Exception):
    pass


class ProductInUseError(Exception):
    pass


def _find_by_name(db: Session, business_id: int, name: str) -> Product | None:
    return db.execute(
        select(Product).where(Product.business_id == business_id, func.lower(Product.name) == name.strip().lower())
    ).scalars().first()


def get_owned_product(db: Session, product_id: int, business_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None or product.business_id != business_id:
        raise ProductNotFoundError(f"product {product_id} not found for business {business_id}")
    return product


def create_product(
    db: Session, business_id: int, *, name: str, unit: str, unit_cost: Decimal | None, stock_qty: Decimal
) -> Product:
    if _find_by_name(db, business_id, name) is not None:
        raise ProductNameTakenError(name)
    product = Product(business_id=business_id, name=name.strip(), unit=unit.strip(), unit_cost=unit_cost, stock_qty=stock_qty)
    db.add(product)
    db.flush()
    return product


def update_product(
    db: Session, product_id: int, business_id: int, *, name: str, unit: str, unit_cost: Decimal | None
) -> Product:
    product = get_owned_product(db, product_id, business_id)
    same_name = _find_by_name(db, business_id, name)
    if same_name is not None and same_name.id != product.id:
        raise ProductNameTakenError(name)
    product.name = name.strip()
    product.unit = unit.strip()
    product.unit_cost = unit_cost
    db.flush()
    return product


def adjust_stock(
    db: Session, product_id: int, business_id: int, *, change: Decimal | None = None, set_to: Decimal | None = None
) -> Product:
    """Manual correction outside sales/purchases (a recount, damaged or lost goods): add `change`, or set the count."""
    product = get_owned_product(db, product_id, business_id)
    product.stock_qty = set_to if set_to is not None else product.stock_qty + (change or Decimal("0"))
    db.flush()
    return product


def delete_product(db: Session, product_id: int, business_id: int) -> None:
    """Only products no transaction points at — removing others would break the shop's history."""
    product = get_owned_product(db, product_id, business_id)
    used = db.execute(select(Transaction.id).where(Transaction.product_id == product.id).limit(1)).first()
    if used is not None:
        raise ProductInUseError(product.name)
    db.delete(product)
    db.flush()


def get_or_create_product(db: Session, business_id: int, name: str) -> Product:
    name = name.strip()
    existing = db.execute(
        select(Product).where(Product.business_id == business_id, func.lower(Product.name) == name.lower())
    ).scalars().first()
    if existing is not None:
        return existing

    product = Product(business_id=business_id, name=name, stock_qty=Decimal("0"))
    db.add(product)
    db.flush()
    return product


def apply_stock_movement(db: Session, txn: Transaction) -> None:
    """Call once, when `txn` becomes confirmed."""
    if txn.product is None or txn.quantity is None or txn.is_personal:
        return

    if txn.type == IncomeExpenseType.INCOME:
        txn.product.stock_qty -= txn.quantity
    else:
        txn.product.stock_qty += txn.quantity
        if txn.quantity > 0:
            txn.product.unit_cost = (txn.amount / txn.quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    db.flush()
