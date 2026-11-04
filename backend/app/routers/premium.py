from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.mock_data_loader import load_json

router = APIRouter(prefix="/api/premium", tags=["premium"])

FREE_PLAN_ID = "free"
BILLING_DAYS = 30

# In-memory plan change for the demo — keeps mock-data/subscription.json untouched;
# resets when the server restarts. No payment is taken.
_chosen_plan: dict[str, str] = {}


class SubscribeIn(BaseModel):
    plan_id: str


def _current_user() -> dict:
    data = load_json("subscription.json")
    user = dict(data["current_user"])
    plan_id = _chosen_plan.get(user["user_id"])
    if plan_id is None or plan_id == user["plan_id"]:
        return user
    plan = next(p for p in data["plans"] if p["plan_id"] == plan_id)
    if plan_id == FREE_PLAN_ID:
        user.update(plan_id=plan_id, status="free", is_premium=False, days_left_in_trial=None,
                    next_billing_date=None, next_billing_amount_thb=None, banner=None)
    else:
        next_billing = date.today() + timedelta(days=BILLING_DAYS)
        user.update(
            plan_id=plan_id,
            status="active",
            is_premium=True,
            days_left_in_trial=None,
            next_billing_date=next_billing.isoformat(),
            next_billing_amount_thb=plan["price_thb_per_month"],
            banner={"type": "info", "message": f"สมัคร {plan['name']} แล้ว รอบบิลถัดไป {next_billing.isoformat()}"},
        )
    return user


def _find_user(user_id: str) -> dict:
    data = load_json("subscription.json")
    if data["current_user"]["user_id"] == user_id:
        return _current_user()
    user = next((u for u in data["demo_users"] if u["user_id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/plans")
def get_plans():
    data = load_json("subscription.json")
    return data["plans"]


@router.get("/status-rules")
def get_status_rules():
    data = load_json("subscription.json")
    return data["status_rules"]


@router.get("/status")
def get_status(user_id: Optional[str] = None):
    """สถานะ subscription ของ user คนเดียว — ไม่ใส่ user_id จะได้ current_user (ร้านของฉัน)"""
    if not user_id:
        return _current_user()
    return _find_user(user_id)


@router.post("/subscribe")
def subscribe(body: SubscribeIn):
    """Switch the current shop to a plan (demo: no payment, kept in memory)."""
    data = load_json("subscription.json")
    if not any(p["plan_id"] == body.plan_id for p in data["plans"]):
        raise HTTPException(status_code=404, detail="Plan not found")
    _chosen_plan[data["current_user"]["user_id"]] = body.plan_id
    return _current_user()


@router.get("/users")
def list_users():
    """รายชื่อ user ตัวอย่างครบทุกสถานะ (free/trialing/active/past_due/canceled/expired) ไว้สลับทดสอบ UI"""
    data = load_json("subscription.json")
    return [_current_user(), *data["demo_users"]]


@router.get("/billing-history")
def billing_history(user_id: Optional[str] = None):
    data = load_json("subscription.json")
    history = data["billing_history"]
    if user_id:
        history = [h for h in history if h["user_id"] == user_id]
    return history
