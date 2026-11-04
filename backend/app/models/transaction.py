from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import IncomeExpenseType, TransactionSource, TransactionStatus

if TYPE_CHECKING:
    from app.models.attachment import Attachment
    from app.models.business import Business
    from app.models.category import Category
    from app.models.product import Product


class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    type: Mapped[IncomeExpenseType] = mapped_column(
        Enum(IncomeExpenseType, name="transaction_type", native_enum=False), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    txn_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_personal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    source: Mapped[TransactionSource] = mapped_column(
        Enum(TransactionSource, name="transaction_source", native_enum=False), nullable=False
    )
    raw_input: Mapped[str | None] = mapped_column(Text, nullable=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(14, 3), nullable=True)
    ai_confidence: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus, name="transaction_status", native_enum=False),
        default=TransactionStatus.PENDING,
        nullable=False,
    )

    business: Mapped["Business"] = relationship(back_populates="transactions")
    category: Mapped["Category | None"] = relationship()
    product: Mapped["Product | None"] = relationship()
    attachments: Mapped[list["Attachment"]] = relationship(back_populates="transaction")
