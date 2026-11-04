"""Endpoints for the web dashboard's My Business tab (pending transactions can be edited, confirmed or cancelled here too)."""

import calendar
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.analytics import business_overview
from app.core.db import get_db
from app.core.errors import ApiError
from app.models import Business, Category, Product, Transaction
from app.models.enums import IncomeExpenseType, TransactionStatus
from app.routers.dependencies import get_current_business
from app.schemas.dashboard import (
    BusinessOut,
    BusinessUpdateIn,
    CategoryOut,
    CategoryTotalOut,
    DailyPointOut,
    OverviewOut,
    ProductCreateIn,
    ProductOut,
    ProductUpdateIn,
    StockAdjustIn,
    TaxMeterOut,
    TopProductOut,
    TransactionCreateIn,
    TransactionOut,
    TransactionUpdateIn,
)
from app.services import inventory_service, product_image_service, transaction_service

router = APIRouter(tags=["dashboard"])

TREND_DAYS = 30
MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"


def _month_range(month: str | None) -> tuple[date, date]:
    """First..last day of a "YYYY-MM" month (default: this month), never past today."""
    today = date.today()
    if month is None:
        return today.replace(day=1), today
    year, month_no = (int(part) for part in month.split("-"))
    start = date(year, month_no, 1)
    end = date(year, month_no, calendar.monthrange(year, month_no)[1])
    return start, min(end, today) if start <= today else end


@router.get("/dashboard/overview", response_model=OverviewOut)
def get_overview(
    month: str | None = Query(default=None, pattern=MONTH_PATTERN),
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> OverviewOut:
    """A month's income/expense/profit and best sellers (default: month to date), plus a 30-day daily trend."""
    month_start, period_end = _month_range(month)
    income, expense = business_overview.period_totals(db, business.id, month_start, period_end)
    daily = business_overview.daily_series(db, business.id, period_end - timedelta(days=TREND_DAYS - 1), period_end)
    top = business_overview.top_products(db, business.id, month_start, period_end)
    return OverviewOut(
        business_name=business.name,
        period_start=month_start,
        period_end=period_end,
        income=income,
        expense=expense,
        net_profit=income - expense,
        daily=[DailyPointOut(date=p.day, income=p.income, expense=p.expense) for p in daily],
        top_products=[
            TopProductOut(
                product_id=t.product.id,
                name=t.product.name,
                unit=t.product.unit,
                quantity_sold=t.quantity_sold,
                revenue=t.revenue,
                stock_qty=t.product.stock_qty,
                image_url=product_image_service.image_url(t.product.id),
            )
            for t in top
        ],
    )


@router.get("/tax/meter", response_model=TaxMeterOut)
def get_tax_meter(
    business: Business = Depends(get_current_business), db: Session = Depends(get_db)
) -> TaxMeterOut:
    """Year-to-date confirmed income against the VAT registration threshold."""
    annual_income = transaction_service.current_year_confirmed_income(db, business.id)
    meter = business_overview.tax_meter(annual_income, date.today().year)
    return TaxMeterOut(
        year=meter.year,
        annual_income=meter.annual_income,
        threshold=meter.threshold,
        ratio=meter.ratio,
        color=meter.color,
        registration_required=meter.registration_required,
    )


@router.get("/dashboard/categories", response_model=list[CategoryTotalOut])
def get_category_totals(
    type: IncomeExpenseType = IncomeExpenseType.EXPENSE,
    month: str | None = Query(default=None, pattern=MONTH_PATTERN),
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> list[CategoryTotalOut]:
    """Confirmed income or expense of a month per category, largest first."""
    start, end = _month_range(month)
    totals = business_overview.category_totals(db, business.id, start, end, type)
    return [CategoryTotalOut(category=t.category, total=t.total) for t in totals]


@router.get("/transactions", response_model=list[TransactionOut])
def list_transactions(
    limit: int = Query(default=50, ge=1, le=200),
    month: str | None = Query(default=None, pattern=MONTH_PATTERN),
    type: IncomeExpenseType | None = None,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> list[TransactionOut]:
    filters = [Transaction.business_id == business.id]
    if month is not None:
        start, end = _month_range(month)
        filters += [Transaction.txn_date >= start, Transaction.txn_date <= end]
    if type is not None:
        filters.append(Transaction.type == type)
    txns = db.execute(
        select(Transaction)
        .options(joinedload(Transaction.category), joinedload(Transaction.product))
        .where(*filters)
        .order_by(Transaction.txn_date.desc(), Transaction.id.desc())
        .limit(limit)
    ).scalars().all()
    return [_transaction_out(t) for t in txns]


@router.post("/transactions", response_model=TransactionOut, status_code=201)
def create_transaction(
    body: TransactionCreateIn,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> TransactionOut:
    """Record income/expense typed on the web; it counts (and moves stock) immediately."""
    txn = transaction_service.create_manual_transaction(
        db,
        business.id,
        type_=body.type,
        amount=body.amount,
        description=body.description,
        txn_date=body.txn_date,
        category_name=body.category,
        product_name=body.product_name,
        quantity=body.quantity,
    )
    db.commit()
    return _transaction_out(txn)


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(
    type: IncomeExpenseType | None = None,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> list[CategoryOut]:
    """The shop's own categories plus shared ones, for the entry form."""
    filters = [(Category.business_id == business.id) | (Category.business_id.is_(None))]
    if type is not None:
        filters.append(Category.type == type)
    categories = db.execute(select(Category).where(*filters).order_by(Category.id)).scalars().all()
    return [CategoryOut(id=c.id, name=c.name_th, type=c.type) for c in categories]


@router.get("/business", response_model=BusinessOut)
def get_business(business: Business = Depends(get_current_business)) -> BusinessOut:
    return BusinessOut(name=business.name, business_type=business.business_type, vat_registered=business.vat_registered)


@router.patch("/business", response_model=BusinessOut)
def update_business(
    body: BusinessUpdateIn,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> BusinessOut:
    business.name = body.name.strip()
    business.business_type = body.business_type.strip()
    db.commit()
    return get_business(business)


def _transaction_out(t: Transaction) -> TransactionOut:
    return TransactionOut(
        id=t.id,
        type=t.type,
        amount=t.amount,
        description=t.description,
        category=t.category.name_th if t.category else None,
        txn_date=t.txn_date,
        status=t.status,
        source=t.source,
        product_name=t.product.name if t.product else None,
        quantity=t.quantity,
    )


def _owned(db: Session, transaction_id: int, business: Business) -> Transaction:
    try:
        return transaction_service.get_owned_transaction(db, transaction_id, business.id)
    except transaction_service.TransactionNotFoundError as exc:
        raise ApiError(404, "transaction_not_found", "ไม่พบรายการนี้") from exc


def _require_pending(txn: Transaction) -> None:
    if txn.status != TransactionStatus.PENDING:
        raise ApiError(409, "transaction_not_pending", "รายการนี้ยืนยันหรือยกเลิกไปแล้ว แก้ไขไม่ได้")


@router.patch("/transactions/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    body: TransactionUpdateIn,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> TransactionOut:
    _require_pending(_owned(db, transaction_id, business))
    txn = transaction_service.update_pending_transaction(
        db,
        transaction_id,
        business.id,
        type_=body.type,
        amount=body.amount,
        description=body.description,
        txn_date=body.txn_date,
        product_name=body.product_name,
        quantity=body.quantity,
    )
    db.commit()
    return _transaction_out(txn)


@router.post("/transactions/{transaction_id}/confirm", response_model=TransactionOut)
def confirm_transaction(
    transaction_id: int, business: Business = Depends(get_current_business), db: Session = Depends(get_db)
) -> TransactionOut:
    _require_pending(_owned(db, transaction_id, business))
    txn = transaction_service.confirm_transaction(db, transaction_id, business.id)
    db.commit()
    return _transaction_out(txn)


@router.post("/transactions/{transaction_id}/cancel", response_model=TransactionOut)
def cancel_transaction(
    transaction_id: int, business: Business = Depends(get_current_business), db: Session = Depends(get_db)
) -> TransactionOut:
    _require_pending(_owned(db, transaction_id, business))
    txn = transaction_service.cancel_transaction(db, transaction_id, business.id)
    db.commit()
    return _transaction_out(txn)


@router.get("/products", response_model=list[ProductOut])
def list_products(
    business: Business = Depends(get_current_business), db: Session = Depends(get_db)
) -> list[ProductOut]:
    products = db.execute(
        select(Product).where(Product.business_id == business.id).order_by(Product.stock_qty, Product.name)
    ).scalars().all()
    return [_product_out(p) for p in products]


def _product_out(product: Product) -> ProductOut:
    return ProductOut(
        id=product.id,
        name=product.name,
        unit=product.unit,
        unit_cost=product.unit_cost,
        stock_qty=product.stock_qty,
        image_url=product_image_service.image_url(product.id),
    )


def _product_errors(action):
    """Runs a product change, turning the service's errors into the API's error contract."""
    try:
        return action()
    except inventory_service.ProductNotFoundError as exc:
        raise ApiError(404, "product_not_found", "ไม่พบสินค้านี้") from exc
    except inventory_service.ProductNameTakenError as exc:
        raise ApiError(409, "product_name_taken", "มีสินค้าชื่อนี้อยู่แล้ว") from exc
    except inventory_service.ProductInUseError as exc:
        raise ApiError(409, "product_in_use", "สินค้านี้มีรายการขาย/ซื้ออยู่แล้ว ลบไม่ได้ ปรับสต็อกเป็น 0 แทนได้") from exc


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(
    body: ProductCreateIn, business: Business = Depends(get_current_business), db: Session = Depends(get_db)
) -> ProductOut:
    product = _product_errors(
        lambda: inventory_service.create_product(
            db, business.id, name=body.name, unit=body.unit, unit_cost=body.unit_cost, stock_qty=body.stock_qty
        )
    )
    db.commit()
    return _product_out(product)


@router.patch("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    body: ProductUpdateIn,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> ProductOut:
    product = _product_errors(
        lambda: inventory_service.update_product(
            db, product_id, business.id, name=body.name, unit=body.unit, unit_cost=body.unit_cost
        )
    )
    db.commit()
    return _product_out(product)


@router.post("/products/{product_id}/stock", response_model=ProductOut)
def adjust_stock(
    product_id: int,
    body: StockAdjustIn,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> ProductOut:
    """Correct the count by hand (recount, damaged or lost goods) — sales and purchases still move it on their own."""
    product = _product_errors(
        lambda: inventory_service.adjust_stock(db, product_id, business.id, change=body.change, set_to=body.set_to)
    )
    db.commit()
    return _product_out(product)


@router.delete("/products/{product_id}", status_code=204)
def delete_product(
    product_id: int, business: Business = Depends(get_current_business), db: Session = Depends(get_db)
) -> None:
    _product_errors(lambda: inventory_service.delete_product(db, product_id, business.id))
    db.commit()
    product_image_service.delete_image(product_id)


@router.put("/products/{product_id}/image", response_model=ProductOut)
async def upload_product_image(
    product_id: int,
    request: Request,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
) -> ProductOut:
    """Raw image bytes in the body (JPG/PNG/WebP, max 5 MB) — no multipart, so no extra dependency."""
    product = _product_errors(lambda: inventory_service.get_owned_product(db, product_id, business.id))
    try:
        product_image_service.save_image(product.id, await request.body())
    except product_image_service.InvalidImageError as exc:
        raise ApiError(422, "invalid_image", str(exc)) from exc
    return _product_out(product)


@router.delete("/products/{product_id}/image", response_model=ProductOut)
def delete_product_image(
    product_id: int, business: Business = Depends(get_current_business), db: Session = Depends(get_db)
) -> ProductOut:
    product = _product_errors(lambda: inventory_service.get_owned_product(db, product_id, business.id))
    product_image_service.delete_image(product.id)
    return _product_out(product)


@router.get("/products/{product_id}/image", include_in_schema=False)
def get_product_image(product_id: int) -> FileResponse:
    """Public on purpose: <img> can't send the login token, and a product photo isn't private."""
    path = product_image_service.image_path(product_id)
    if path is None:
        raise ApiError(404, "image_not_found", "สินค้านี้ยังไม่มีรูป")
    return FileResponse(path, media_type=product_image_service.MEDIA_TYPES[path.suffix])
