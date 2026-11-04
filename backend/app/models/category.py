from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import IncomeExpenseType

if TYPE_CHECKING:
    from app.models.business import Business


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int | None] = mapped_column(ForeignKey("businesses.id"), nullable=True)
    name_th: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[IncomeExpenseType] = mapped_column(
        Enum(IncomeExpenseType, name="category_type", native_enum=False), nullable=False
    )

    business: Mapped["Business | None"] = relationship(back_populates="categories")
