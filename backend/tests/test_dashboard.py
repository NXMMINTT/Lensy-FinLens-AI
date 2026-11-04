from datetime import date, timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.analytics import business_overview
from app.core.db import get_db
from app.main import app
from app.models import Base, Business, Product, Transaction, User
from app.models.enums import (
    ExpenseMethod,
    IncomeExpenseType,
    TaxStatus,
    TransactionSource,
    TransactionStatus,
)
from app.routers import dependencies
from app.services import auth_service, product_image_service, user_service


@pytest.fixture()
def session() -> Session:
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    db = sessionmaker(bind=engine)()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(session: Session, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setattr(dependencies.settings, "liff_id", "")
    monkeypatch.setattr(dependencies.settings, "dashboard_line_user_id", "")
    app.dependency_overrides[get_db] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()


def _shop(db: Session, line_user_id: str, name: str) -> Business:
    user = User(line_user_id=line_user_id, display_name=name)
    db.add(user)
    db.flush()
    biz = Business(
        owner_id=user.id,
        name=name,
        business_type="ของฝาก",
        tax_status=TaxStatus.INDIVIDUAL,
        vat_registered=False,
        expense_method=ExpenseMethod.FLAT_RATE,
    )
    db.add(biz)
    db.flush()
    return biz


def _txn(
    db: Session,
    biz: Business,
    type_: IncomeExpenseType,
    amount: str,
    day: date,
    product: Product | None = None,
    quantity: str | None = None,
    status: TransactionStatus = TransactionStatus.CONFIRMED,
    is_personal: bool = False,
) -> None:
    db.add(
        Transaction(
            business_id=biz.id,
            type=type_,
            amount=Decimal(amount),
            txn_date=day,
            description="x",
            product_id=product.id if product else None,
            quantity=Decimal(quantity) if quantity else None,
            is_personal=is_personal,
            source=TransactionSource.TEXT,
            status=status,
        )
    )
    db.flush()


@pytest.mark.parametrize(
    ("annual_income", "color", "required"),
    [
        ("1000000", "green", False),
        ("1440000", "yellow", False),
        ("1620000", "red", False),
        ("1800000", "red", True),
    ],
)
def test_tax_meter_color(annual_income: str, color: str, required: bool):
    meter = business_overview.tax_meter(Decimal(annual_income), 2026)
    assert meter.color == color
    assert meter.registration_required is required
    assert meter.threshold == Decimal("1800000")


def test_overview_counts_only_confirmed_shop_transactions_this_month(client: TestClient, session: Session):
    biz = _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    today = date.today()
    chili = Product(business_id=biz.id, name="น้ำพริกเผา", unit="กระปุก", stock_qty=Decimal("12"))
    banana = Product(business_id=biz.id, name="กล้วยตาก", unit="ถุง", stock_qty=Decimal("3"))
    soap = Product(business_id=biz.id, name="สบู่", unit="ก้อน", stock_qty=Decimal("0"))
    tea = Product(business_id=biz.id, name="ชาไทย", unit="ถุง", stock_qty=Decimal("8"))
    session.add_all([chili, banana, soap, tea])
    session.flush()

    _txn(session, biz, IncomeExpenseType.INCOME, "1000", today, chili, "10")
    _txn(session, biz, IncomeExpenseType.INCOME, "600", today, banana, "6")
    _txn(session, biz, IncomeExpenseType.INCOME, "300", today, soap, "3")
    _txn(session, biz, IncomeExpenseType.INCOME, "100", today, tea, "1")
    _txn(session, biz, IncomeExpenseType.EXPENSE, "400", today)
    # Excluded: pending, personal, and anything before this month.
    _txn(session, biz, IncomeExpenseType.INCOME, "9999", today, tea, "50", status=TransactionStatus.PENDING)
    _txn(session, biz, IncomeExpenseType.EXPENSE, "777", today, is_personal=True)
    _txn(session, biz, IncomeExpenseType.INCOME, "5000", today.replace(day=1) - timedelta(days=1))

    response = client.get("/api/v1/dashboard/overview")
    assert response.status_code == 200
    body = response.json()

    assert body["business_name"] == "ร้านสาธิต"
    assert Decimal(body["income"]) == Decimal("2000")
    assert Decimal(body["expense"]) == Decimal("400")
    assert Decimal(body["net_profit"]) == Decimal("1600")
    assert [p["name"] for p in body["top_products"]] == ["น้ำพริกเผา", "กล้วยตาก", "สบู่"]
    assert Decimal(body["top_products"][0]["quantity_sold"]) == Decimal("10")
    assert Decimal(body["top_products"][1]["stock_qty"]) == Decimal("3")
    assert len(body["daily"]) == 30
    assert body["daily"][-1]["date"] == today.isoformat()
    assert Decimal(body["daily"][-1]["income"]) == Decimal("2000")


def test_tax_meter_endpoint(client: TestClient, session: Session):
    biz = _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    _txn(session, biz, IncomeExpenseType.INCOME, "1500000", date.today())

    body = client.get("/api/v1/tax/meter").json()

    assert Decimal(body["annual_income"]) == Decimal("1500000")
    assert Decimal(body["ratio"]) == Decimal("0.8333")
    assert body["color"] == "yellow"
    assert body["registration_required"] is False


def test_transactions_and_products_lists(client: TestClient, session: Session):
    biz = _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    chili = Product(business_id=biz.id, name="น้ำพริกเผา", unit="กระปุก", stock_qty=Decimal("12"))
    banana = Product(business_id=biz.id, name="กล้วยตาก", unit="ถุง", stock_qty=Decimal("2"))
    session.add_all([chili, banana])
    session.flush()
    _txn(session, biz, IncomeExpenseType.INCOME, "100", date.today() - timedelta(days=1))
    _txn(session, biz, IncomeExpenseType.INCOME, "500", date.today(), chili, "5", status=TransactionStatus.PENDING)

    txns = client.get("/api/v1/transactions").json()
    assert [t["amount"] for t in txns] == ["500.00", "100.00"]
    assert txns[0]["product_name"] == "น้ำพริกเผา"
    assert txns[0]["status"] == "pending"

    products = client.get("/api/v1/products").json()
    assert [p["name"] for p in products] == ["กล้วยตาก", "น้ำพริกเผา"]


def test_bearer_jwt_selects_that_users_shop(client: TestClient, session: Session):
    _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    _shop(session, "Ureal", "ร้านจริง")

    token = auth_service.issue_jwt("Ureal")
    body = client.get("/api/v1/dashboard/overview", headers={"Authorization": f"Bearer {token}"}).json()
    assert body["business_name"] == "ร้านจริง"


def test_dashboard_line_user_id_replaces_demo_shop_without_liff(
    client: TestClient, session: Session, monkeypatch: pytest.MonkeyPatch
):
    _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    _shop(session, "Ureal", "ร้านจริง")
    monkeypatch.setattr(dependencies.settings, "dashboard_line_user_id", "Ureal")

    body = client.get("/api/v1/dashboard/overview").json()
    assert body["business_name"] == "ร้านจริง"


def test_invalid_jwt_returns_error_contract(client: TestClient, session: Session):
    response = client.get("/api/v1/tax/meter", headers={"Authorization": "Bearer garbage"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_token"


def test_liff_configured_requires_login(client: TestClient, session: Session, monkeypatch: pytest.MonkeyPatch):
    _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    monkeypatch.setattr(dependencies.settings, "liff_id", "1234567890-abcdefgh")

    response = client.get("/api/v1/tax/meter")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthenticated"


def test_missing_demo_shop_returns_404(client: TestClient):
    response = client.get("/api/v1/products")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "business_not_found"


def test_line_login_exchanges_id_token_for_jwt(
    client: TestClient, session: Session, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setattr(dependencies.settings, "liff_id", "1234567890-abcdefgh")
    monkeypatch.setattr(
        auth_service,
        "verify_line_id_token",
        lambda token: auth_service.LineProfile(line_user_id="Unew", display_name="แม่ค้าใหม่"),
    )

    response = client.post("/api/v1/auth/line", json={"id_token": "id-token"})
    assert response.status_code == 200
    assert auth_service.decode_jwt(response.json()["access_token"]) == "Unew"
    user = session.query(User).filter_by(line_user_id="Unew").one()
    assert user.display_name == "แม่ค้าใหม่"
    assert len(user.businesses) == 1


def test_liff_channel_id_is_liff_id_prefix(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(auth_service.settings, "liff_id", "1657000000-AbCdEfGh")
    assert auth_service.liff_channel_id() == "1657000000"


def test_edit_then_confirm_pending_transaction_moves_stock(client: TestClient, session: Session):
    biz = _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    _txn(session, biz, IncomeExpenseType.INCOME, "100", date.today(), status=TransactionStatus.PENDING)
    txn_id = session.query(Transaction).one().id

    body = {
        "type": "expense",
        "amount": "1200",
        "description": "ซื้อน้ำพริก",
        "txn_date": date.today().isoformat(),
        "product_name": "น้ำพริกเผา",
        "quantity": "20",
    }
    edited = client.patch(f"/api/v1/transactions/{txn_id}", json=body).json()
    assert edited["type"] == "expense"
    assert edited["product_name"] == "น้ำพริกเผา"
    assert edited["status"] == "pending"

    assert client.post(f"/api/v1/transactions/{txn_id}/confirm").json()["status"] == "confirmed"
    product = client.get("/api/v1/products").json()[0]
    assert Decimal(product["stock_qty"]) == Decimal("20")


def test_confirmed_transaction_is_not_editable(client: TestClient, session: Session):
    biz = _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    _txn(session, biz, IncomeExpenseType.INCOME, "100", date.today())
    txn_id = session.query(Transaction).one().id

    response = client.post(f"/api/v1/transactions/{txn_id}/cancel")
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "transaction_not_pending"


def test_other_shops_transaction_is_not_found(client: TestClient, session: Session):
    _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    other = _shop(session, "Uother", "ร้านอื่น")
    _txn(session, other, IncomeExpenseType.INCOME, "100", date.today(), status=TransactionStatus.PENDING)
    txn_id = session.query(Transaction).one().id

    response = client.post(f"/api/v1/transactions/{txn_id}/confirm")
    assert response.status_code == 404


def test_web_entry_is_confirmed_counts_and_moves_stock(client: TestClient, session: Session):
    _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    today = date.today().isoformat()

    bought = client.post(
        "/api/v1/transactions",
        json={"type": "expense", "amount": "900", "description": "ซื้อพริกแห้ง", "txn_date": today,
              "category": "ค่าซื้อสินค้า", "product_name": "พริกแห้ง", "quantity": "2"},
    )
    assert bought.status_code == 201
    assert bought.json()["status"] == "confirmed"
    assert bought.json()["source"] == "web"
    assert bought.json()["category"] == "ค่าซื้อสินค้า"
    client.post("/api/v1/transactions", json={"type": "income", "amount": "1780", "txn_date": today})

    overview = client.get("/api/v1/dashboard/overview").json()
    assert Decimal(overview["income"]) == Decimal("1780")
    assert Decimal(overview["expense"]) == Decimal("900")
    assert Decimal(client.get("/api/v1/products").json()[0]["stock_qty"]) == Decimal("2")
    assert [c["name"] for c in client.get("/api/v1/categories?type=expense").json()] == ["ค่าซื้อสินค้า"]


def test_month_filters_overview_transactions_and_category_totals(client: TestClient, session: Session):
    biz = _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    last_month_day = date.today().replace(day=1) - timedelta(days=1)
    last_month = last_month_day.strftime("%Y-%m")
    _txn(session, biz, IncomeExpenseType.INCOME, "500", last_month_day)
    _txn(session, biz, IncomeExpenseType.EXPENSE, "120", last_month_day)
    _txn(session, biz, IncomeExpenseType.EXPENSE, "80", date.today())

    overview = client.get(f"/api/v1/dashboard/overview?month={last_month}").json()
    assert Decimal(overview["income"]) == Decimal("500")
    assert overview["period_end"] == last_month_day.isoformat()
    listed = client.get(f"/api/v1/transactions?month={last_month}&type=expense").json()
    assert [Decimal(t["amount"]) for t in listed] == [Decimal("120")]
    totals = client.get(f"/api/v1/dashboard/categories?month={last_month}&type=expense").json()
    assert totals == [{"category": business_overview.UNCATEGORIZED, "total": "120.00"}]
    assert client.get("/api/v1/dashboard/overview?month=2026-13").status_code == 422


def test_shop_settings_can_be_renamed(client: TestClient, session: Session):
    _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    assert client.get("/api/v1/business").json()["name"] == "ร้านสาธิต"

    updated = client.patch("/api/v1/business", json={"name": " ร้านใหม่ ", "business_type": "อาหาร"})
    assert updated.json() == {"name": "ร้านใหม่", "business_type": "อาหาร", "vat_registered": False}
    assert client.get("/api/v1/dashboard/overview").json()["business_name"] == "ร้านใหม่"


def test_products_can_be_added_edited_adjusted_and_deleted(client: TestClient, session: Session):
    _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")

    created = client.post("/api/v1/products", json={"name": "น้ำพริกเผา", "unit": "กระปุก", "unit_cost": "30", "stock_qty": "10"})
    assert created.status_code == 201
    product_id = created.json()["id"]
    assert client.post("/api/v1/products", json={"name": " น้ำพริกเผา "}).json()["error"]["code"] == "product_name_taken"

    edited = client.patch(f"/api/v1/products/{product_id}", json={"name": "น้ำพริกเผาสูตรเด็ด", "unit": "ขวด", "unit_cost": "32"})
    assert edited.json()["name"] == "น้ำพริกเผาสูตรเด็ด"
    assert edited.json()["unit"] == "ขวด"

    removed = client.post(f"/api/v1/products/{product_id}/stock", json={"change": "-3"}).json()
    assert Decimal(removed["stock_qty"]) == Decimal("7")
    counted = client.post(f"/api/v1/products/{product_id}/stock", json={"set_to": "25"}).json()
    assert Decimal(counted["stock_qty"]) == Decimal("25")
    assert client.post(f"/api/v1/products/{product_id}/stock", json={"change": "1", "set_to": "2"}).status_code == 422

    assert client.delete(f"/api/v1/products/{product_id}").status_code == 204
    assert client.get("/api/v1/products").json() == []


def test_product_with_transactions_cannot_be_deleted(client: TestClient, session: Session):
    biz = _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    chili = Product(business_id=biz.id, name="น้ำพริกเผา", unit="กระปุก", stock_qty=Decimal("5"))
    session.add(chili)
    session.flush()
    _txn(session, biz, IncomeExpenseType.INCOME, "100", date.today(), chili, "1")

    response = client.delete(f"/api/v1/products/{chili.id}")
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "product_in_use"
    other = _shop(session, "Uother", "ร้านอื่น")
    foreign = Product(business_id=other.id, name="สบู่", unit="ก้อน", stock_qty=Decimal("1"))
    session.add(foreign)
    session.flush()
    assert client.post(f"/api/v1/products/{foreign.id}/stock", json={"set_to": "0"}).status_code == 404


PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32


def test_product_photo_upload_serve_replace_and_delete(
    client: TestClient, session: Session, tmp_path, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setattr(product_image_service.settings, "upload_dir", tmp_path)
    _shop(session, user_service.DEMO_LINE_USER_ID, "ร้านสาธิต")
    product_id = client.post("/api/v1/products", json={"name": "สบู่", "unit": "ก้อน"}).json()["id"]
    assert client.get("/api/v1/products").json()[0]["image_url"] is None

    uploaded = client.put(f"/api/v1/products/{product_id}/image", content=PNG_BYTES, headers={"Content-Type": "image/png"})
    assert uploaded.status_code == 200
    url = uploaded.json()["image_url"]
    assert url.startswith(f"/api/v1/products/{product_id}/image?v=")
    served = client.get(url)
    assert served.status_code == 200
    assert served.headers["content-type"] == "image/png"
    assert served.content == PNG_BYTES

    not_image = client.put(f"/api/v1/products/{product_id}/image", content=b"hello", headers={"Content-Type": "image/png"})
    assert not_image.json()["error"]["code"] == "invalid_image"

    assert client.delete(f"/api/v1/products/{product_id}/image").json()["image_url"] is None
    assert client.get(f"/api/v1/products/{product_id}/image").status_code == 404
