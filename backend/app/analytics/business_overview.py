"""Aggregations for the My Business dashboard. Only confirmed, non-personal
transactions count toward the shop's figures.
"""

from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Category, Product, Transaction
from app.models.enums import IncomeExpenseType, TransactionStatus
from app.tax_engine import vat
from app.tax_engine.rules_loader import load_tax_rules

ZERO = Decimal("0")

# vat_warning_level() names come from config/tax_rules.yaml.
_METER_COLOR_BY_WARNING_LEVEL = {"near": "yellow", "high": "red"}


@dataclass
class DailyPoint:
    day: date
    income: Decimal
    expense: Decimal


@dataclass
class TopProduct:
    product: Product
    quantity_sold: Decimal
    revenue: Decimal


@dataclass
class TaxMeter:
    year: int
    annual_income: Decimal
    threshold: Decimal
    ratio: Decimal
    color: str
    registration_required: bool


def _shop_filter(business_id: int, start: date, end: date) -> list:
    return [
        Transaction.business_id == business_id,
        Transaction.status == TransactionStatus.CONFIRMED,
        Transaction.is_personal.is_(False),
        Transaction.txn_date >= start,
        Transaction.txn_date <= end,
    ]


def period_totals(db: Session, business_id: int, start: date, end: date) -> tuple[Decimal, Decimal]:
    """Returns (income_total, expense_total) for start..end inclusive."""
    rows = db.execute(
        select(Transaction.type, func.sum(Transaction.amount))
        .where(*_shop_filter(business_id, start, end))
        .group_by(Transaction.type)
    ).all()
    totals = {type_: Decimal(total) for type_, total in rows}
    return totals.get(IncomeExpenseType.INCOME, ZERO), totals.get(IncomeExpenseType.EXPENSE, ZERO)


def daily_series(db: Session, business_id: int, start: date, end: date) -> list[DailyPoint]:
    """One point per day in start..end inclusive, zero-filled."""
    rows = db.execute(
        select(Transaction.txn_date, Transaction.type, func.sum(Transaction.amount))
        .where(*_shop_filter(business_id, start, end))
        .group_by(Transaction.txn_date, Transaction.type)
    ).all()
    by_day: dict[date, DailyPoint] = {}
    day = start
    while day <= end:
        by_day[day] = DailyPoint(day=day, income=ZERO, expense=ZERO)
        day += timedelta(days=1)
    for txn_date, type_, total in rows:
        point = by_day[txn_date]
        if type_ == IncomeExpenseType.INCOME:
            point.income = Decimal(total)
        else:
            point.expense = Decimal(total)
    return list(by_day.values())


def top_products(db: Session, business_id: int, start: date, end: date, limit: int = 3) -> list[TopProduct]:
    """Best sellers by sales revenue in start..end inclusive."""
    revenue = func.sum(Transaction.amount)
    rows = db.execute(
        select(Product, func.sum(Transaction.quantity), revenue)
        .join(Transaction, Transaction.product_id == Product.id)
        .where(*_shop_filter(business_id, start, end), Transaction.type == IncomeExpenseType.INCOME)
        .group_by(Product.id)
        .order_by(revenue.desc())
        .limit(limit)
    ).all()
    return [
        TopProduct(product=product, quantity_sold=Decimal(qty or 0), revenue=Decimal(total))
        for product, qty, total in rows
    ]


@dataclass
class CategoryTotal:
    category: str
    total: Decimal


UNCATEGORIZED = "ไม่ระบุหมวด"


def category_totals(
    db: Session, business_id: int, start: date, end: date, type_: IncomeExpenseType
) -> list[CategoryTotal]:
    """Totals per category in start..end inclusive, largest first."""
    total = func.sum(Transaction.amount)
    rows = db.execute(
        select(Category.name_th, total)
        .select_from(Transaction)
        .outerjoin(Category, Transaction.category_id == Category.id)
        .where(*_shop_filter(business_id, start, end), Transaction.type == type_)
        .group_by(Category.name_th)
        .order_by(total.desc())
    ).all()
    return [CategoryTotal(category=name or UNCATEGORIZED, total=Decimal(amount)) for name, amount in rows]


def tax_meter(annual_income: Decimal, year: int) -> TaxMeter:
    required = vat.is_vat_registration_required(annual_income)
    color = "red" if required else _METER_COLOR_BY_WARNING_LEVEL.get(vat.vat_warning_level(annual_income), "green")
    return TaxMeter(
        year=year,
        annual_income=annual_income,
        threshold=load_tax_rules().vat.annual_threshold,
        ratio=vat.vat_threshold_ratio(annual_income),
        color=color,
        registration_required=required,
    )
