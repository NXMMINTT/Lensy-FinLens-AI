from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import ExpenseMethod, TaxStatus

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.product import Product
    from app.models.transaction import Transaction
    from app.models.user import User


class Business(Base, TimestampMixin):
    __tablename__ = "businesses"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_type: Mapped[str] = mapped_column(String(255), nullable=False)
    tax_status: Mapped[TaxStatus] = mapped_column(
        Enum(TaxStatus, name="tax_status", native_enum=False), nullable=False
    )
    vat_registered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    expense_method: Mapped[ExpenseMethod] = mapped_column(
        Enum(ExpenseMethod, name="expense_method", native_enum=False), nullable=False
    )

    owner: Mapped["User"] = relationship(back_populates="businesses")
    categories: Mapped[list["Category"]] = relationship(back_populates="business")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="business")
    products: Mapped[list["Product"]] = relationship(back_populates="business")
