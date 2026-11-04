"""Response shapes for the web dashboard. Amounts are Decimals, which
serialize as plain decimal strings in JSON.
"""

from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.models.enums import IncomeExpenseType, TransactionSource, TransactionStatus


class DailyPointOut(BaseModel):
    date: date
    income: Decimal
    expense: Decimal


class TopProductOut(BaseModel):
    product_id: int
    name: str
    unit: str
    quantity_sold: Decimal
    revenue: Decimal
    stock_qty: Decimal
    image_url: str | None = None


class OverviewOut(BaseModel):
    business_name: str
    period_start: date
    period_end: date
    income: Decimal
    expense: Decimal
    net_profit: Decimal
    daily: list[DailyPointOut]
    top_products: list[TopProductOut]


class TaxMeterOut(BaseModel):
    year: int
    annual_income: Decimal
    threshold: Decimal
    ratio: Decimal
    color: Literal["green", "yellow", "red"]
    registration_required: bool


class TransactionOut(BaseModel):
    id: int
    type: IncomeExpenseType
    amount: Decimal
    description: str | None
    category: str | None
    txn_date: date
    status: TransactionStatus
    source: TransactionSource
    product_name: str | None
    quantity: Decimal | None


class TransactionUpdateIn(BaseModel):
    type: IncomeExpenseType
    amount: Decimal = Field(gt=0)
    description: str | None = Field(default=None, max_length=500)
    txn_date: date
    product_name: str | None = Field(default=None, max_length=200)
    quantity: Decimal | None = Field(default=None, gt=0)


class TransactionCreateIn(BaseModel):
    type: IncomeExpenseType
    amount: Decimal = Field(gt=0)
    description: str | None = Field(default=None, max_length=500)
    txn_date: date
    category: str | None = Field(default=None, max_length=255)
    product_name: str | None = Field(default=None, max_length=200)
    quantity: Decimal | None = Field(default=None, gt=0)


class CategoryOut(BaseModel):
    id: int
    name: str
    type: IncomeExpenseType


class CategoryTotalOut(BaseModel):
    category: str
    total: Decimal


class BusinessOut(BaseModel):
    name: str
    business_type: str
    vat_registered: bool


class BusinessUpdateIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    business_type: str = Field(min_length=1, max_length=255)


class ProductCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    unit: str = Field(default="ชิ้น", min_length=1, max_length=50)
    unit_cost: Decimal | None = Field(default=None, ge=0)
    stock_qty: Decimal = Field(default=Decimal("0"), ge=0)


class ProductUpdateIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    unit: str = Field(min_length=1, max_length=50)
    unit_cost: Decimal | None = Field(default=None, ge=0)


class StockAdjustIn(BaseModel):
    """Exactly one of: `change` (+ add / − remove) or `set_to` (the counted quantity)."""

    change: Decimal | None = None
    set_to: Decimal | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def _one_of(self) -> "StockAdjustIn":
        if (self.change is None) == (self.set_to is None):
            raise ValueError("ใส่ change หรือ set_to อย่างใดอย่างหนึ่ง")
        return self


class ProductOut(BaseModel):
    id: int
    name: str
    unit: str
    unit_cost: Decimal | None
    stock_qty: Decimal
    image_url: str | None = None
