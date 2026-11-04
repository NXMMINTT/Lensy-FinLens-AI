"""Seed demo data: one community-goods shop selling online, with products,
stock, and year-to-date transactions trending toward the VAT registration
threshold (lands in the Tax Meter's yellow zone by mid-October).

Usage: python scripts/seed_demo.py [--reset]
"""

import random
import sys
from datetime import date, timedelta
from decimal import Decimal

from app.core.db import SessionLocal
from app.models import Attachment, Business, Category, Product, Transaction, User
from app.models.enums import (
    ExpenseMethod,
    IncomeExpenseType,
    TaxStatus,
    TransactionSource,
    TransactionStatus,
)
from app.services.user_service import DEMO_LINE_USER_ID

SHOP_NAME = "ร้านของฝากบ้านสวน"

# name, unit, sale price, unit cost, sales weight
PRODUCTS = [
    ("น้ำพริกเผา", "กระปุก", Decimal("120"), Decimal("55"), 30),
    ("ชาไทยผง", "ถุง", Decimal("159"), Decimal("70"), 25),
    ("ผ้าขาวม้าทอมือ", "ผืน", Decimal("290"), Decimal("150"), 20),
    ("กล้วยตาก", "ถุง", Decimal("89"), Decimal("40"), 15),
    ("สบู่สมุนไพร", "ก้อน", Decimal("65"), Decimal("25"), 10),
]
INCOME_CATEGORIES = ["ขายออนไลน์", "ขายหน้าร้าน"]
PURCHASE_CATEGORY = "ค่าซื้อสินค้า"
EXPENSE_CATEGORIES = [PURCHASE_CATEGORY, "ค่าเช่าร้าน", "ค่าขนส่ง", "ค่าสาธารณูปโภค", "ค่าโฆษณาออนไลน์"]

STARTING_STOCK = Decimal("60")
RESTOCK_BELOW = Decimal("25")
RESTOCK_QTY = Decimal("100")
# Let one product sell out near the end so the dashboard shows a low-stock row.
NO_RESTOCK_LAST_DAYS = {"สบู่สมุนไพร": 30}


def _monthly_revenue_target(month: int) -> Decimal:
    return Decimal(135_000 + (month - 1) * 5_000)


def _delete_demo(db, user: User) -> None:
    for business in user.businesses:
        txn_ids = [t.id for t in business.transactions]
        if txn_ids:
            db.query(Attachment).filter(Attachment.transaction_id.in_(txn_ids)).delete(synchronize_session=False)
        db.query(Transaction).filter_by(business_id=business.id).delete()
        db.query(Product).filter_by(business_id=business.id).delete()
        db.query(Category).filter_by(business_id=business.id).delete()
        db.delete(business)
    db.delete(user)
    db.flush()


def seed(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter_by(line_user_id=DEMO_LINE_USER_ID).one_or_none()
        if existing_user is not None:
            if not reset:
                print("Demo user already exists, skipping seed (use --reset to recreate).")
                return
            _delete_demo(db, existing_user)

        user = User(line_user_id=DEMO_LINE_USER_ID, display_name=SHOP_NAME)
        db.add(user)
        db.flush()

        business = Business(
            owner_id=user.id,
            name=SHOP_NAME,
            business_type="สินค้าชุมชน/ของฝาก",
            tax_status=TaxStatus.INDIVIDUAL,
            vat_registered=False,
            expense_method=ExpenseMethod.FLAT_RATE,
        )
        db.add(business)
        db.flush()

        categories = {
            name: Category(business_id=business.id, name_th=name, type=IncomeExpenseType.INCOME)
            for name in INCOME_CATEGORIES
        } | {
            name: Category(business_id=business.id, name_th=name, type=IncomeExpenseType.EXPENSE)
            for name in EXPENSE_CATEGORIES
        }
        products = {
            name: Product(business_id=business.id, name=name, unit=unit, unit_cost=cost, stock_qty=STARTING_STOCK)
            for name, unit, _price, cost, _weight in PRODUCTS
        }
        db.add_all([*categories.values(), *products.values()])
        db.flush()

        rng = random.Random(42)
        today = date.today()
        transactions: list[Transaction] = []

        def add(type_, amount, category, description, day, product=None, quantity=None, **kwargs):
            transactions.append(
                Transaction(
                    business_id=business.id,
                    type=type_,
                    amount=Decimal(amount).quantize(Decimal("0.01")),
                    category_id=categories[category].id,
                    description=description,
                    txn_date=day,
                    is_personal=False,
                    product_id=product.id if product else None,
                    quantity=quantity,
                    source=kwargs.get("source", TransactionSource.TEXT),
                    status=kwargs.get("status", TransactionStatus.CONFIRMED),
                )
            )

        names = [p[0] for p in PRODUCTS]
        weights = [p[4] for p in PRODUCTS]
        prices = {p[0]: p[2] for p in PRODUCTS}

        day = date(today.year, 1, 1)
        while day <= today:
            days_in_month = ((day.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)).day
            daily_target = _monthly_revenue_target(day.month) / days_in_month * Decimal(rng.uniform(0.7, 1.3))

            # Sales: orders until the day's target is reached; stock is deducted per order.
            day_income = Decimal("0")
            while day_income < daily_target:
                name = rng.choices(names, weights)[0]
                product = products[name]
                quantity = Decimal(rng.randint(1, 5))
                if product.stock_qty < quantity:
                    continue  # can't sell what isn't in stock
                amount = prices[name] * quantity
                add(
                    IncomeExpenseType.INCOME,
                    amount,
                    rng.choices(INCOME_CATEGORIES, [7, 3])[0],
                    f"ขาย{name} {quantity} {product.unit}",
                    day,
                    product,
                    quantity,
                )
                product.stock_qty -= quantity
                day_income += amount

            # Purchases: restock anything running low.
            for name, product in products.items():
                skip_days = NO_RESTOCK_LAST_DAYS.get(name)
                if skip_days and (today - day).days < skip_days:
                    continue
                if product.stock_qty < RESTOCK_BELOW:
                    add(
                        IncomeExpenseType.EXPENSE,
                        product.unit_cost * RESTOCK_QTY,
                        PURCHASE_CATEGORY,
                        f"ซื้อ{name} {RESTOCK_QTY} {product.unit}",
                        day,
                        product,
                        RESTOCK_QTY,
                    )
                    product.stock_qty += RESTOCK_QTY

            if day.day == 1:
                add(IncomeExpenseType.EXPENSE, 6000, "ค่าเช่าร้าน", "ค่าเช่าร้านรายเดือน", day)
            if day.day == 5:
                add(IncomeExpenseType.EXPENSE, rng.uniform(1200, 1800), "ค่าสาธารณูปโภค", "ค่าไฟและค่าน้ำ", day)
            if day.weekday() == 0:
                add(IncomeExpenseType.EXPENSE, rng.uniform(800, 1500), "ค่าโฆษณาออนไลน์", "ยิงแอดโซเชียล", day)
            if day.toordinal() % 3 == 0:
                add(IncomeExpenseType.EXPENSE, rng.uniform(200, 800), "ค่าขนส่ง", "ค่าส่งพัสดุ", day)

            day += timedelta(days=1)

        # A couple of LINE entries still waiting for the owner to confirm.
        add(
            IncomeExpenseType.INCOME, 360, "ขายออนไลน์", "ขายน้ำพริกเผา 3 กระปุก", today,
            products["น้ำพริกเผา"], Decimal("3"), source=TransactionSource.IMAGE, status=TransactionStatus.PENDING,
        )
        add(
            IncomeExpenseType.EXPENSE, 450, "ค่าขนส่ง", "ค่าส่งพัสดุ", today,
            source=TransactionSource.VOICE, status=TransactionStatus.PENDING,
        )

        db.add_all(transactions)
        db.commit()
        stock = ", ".join(f"{name} {p.stock_qty.normalize():f}" for name, p in products.items())
        print(f"Seeded {SHOP_NAME}: {len(transactions)} transactions. Stock: {stock}")
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv[1:])
