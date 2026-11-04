from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.errors import ApiError
from app.core.settings import settings
from app.models import Business, User
from app.services import auth_service, user_service


def get_current_business(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Business:
    """Resolves the dashboard's business from the bearer JWT. Without LIFF
    configured (local dev / demo), unauthenticated requests see the shop of
    DASHBOARD_LINE_USER_ID if set, else the seeded demo shop
    (scripts/seed_demo.py).
    """
    if authorization and authorization.startswith("Bearer "):
        try:
            line_user_id = auth_service.decode_jwt(authorization.removeprefix("Bearer "))
        except auth_service.InvalidTokenError as exc:
            raise ApiError(401, "invalid_token", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่") from exc
    elif not settings.liff_id:
        line_user_id = settings.dashboard_line_user_id or user_service.DEMO_LINE_USER_ID
    else:
        raise ApiError(401, "unauthenticated", "กรุณาเข้าสู่ระบบผ่าน LINE")

    user = db.query(User).filter_by(line_user_id=line_user_id).one_or_none()
    if user is None or not user.businesses:
        raise ApiError(404, "business_not_found", "ยังไม่พบข้อมูลร้าน ลองบันทึกรายการผ่าน LINE ก่อนนะคะ")
    return user.businesses[0]
