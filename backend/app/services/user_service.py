"""Resolves the LINE user and their (single, MVP-default) business."""

from sqlalchemy.orm import Session

from app.models import Business, User
from app.models.enums import ExpenseMethod, TaxStatus

DEMO_LINE_USER_ID = "demo-user-001"
DEFAULT_DISPLAY_NAME = "ผู้ใช้ LINE"
DEFAULT_BUSINESS_NAME = "ร้านของฉัน"
DEFAULT_BUSINESS_TYPE = "อื่นๆ"


def get_or_create_user(db: Session, line_user_id: str) -> User:
    user = db.query(User).filter_by(line_user_id=line_user_id).one_or_none()
    if user is not None:
        return user
    user = User(line_user_id=line_user_id, display_name=DEFAULT_DISPLAY_NAME)
    db.add(user)
    db.flush()
    return user


def get_or_create_default_business(db: Session, user: User) -> Business:
    if user.businesses:
        return user.businesses[0]
    business = Business(
        owner_id=user.id,
        name=DEFAULT_BUSINESS_NAME,
        business_type=DEFAULT_BUSINESS_TYPE,
        tax_status=TaxStatus.INDIVIDUAL,
        vat_registered=False,
        expense_method=ExpenseMethod.FLAT_RATE,
    )
    db.add(business)
    db.flush()
    return business
