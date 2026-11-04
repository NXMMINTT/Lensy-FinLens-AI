from typing import Optional

from fastapi import APIRouter

from app.mock_data_loader import load_json

router = APIRouter(prefix="/api", tags=["insights"])


@router.get("/insights")
def get_insights(tab: Optional[str] = None, product_id: Optional[str] = None):
    insights = load_json("insights.json")
    if tab:
        insights = [i for i in insights if i["tab"] == tab]
    if product_id:
        insights = [i for i in insights if i["related_product_id"] == product_id]
    return insights
