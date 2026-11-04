import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.models import Base, Business, User
from app.models.enums import ExpenseMethod, TaxStatus


@pytest.fixture()
def db_session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def business(db_session: Session) -> Business:
    user = User(line_user_id="test-line-user", display_name="Test User")
    db_session.add(user)
    db_session.flush()

    biz = Business(
        owner_id=user.id,
        name="ร้านทดสอบ",
        business_type="อื่นๆ",
        tax_status=TaxStatus.INDIVIDUAL,
        vat_registered=False,
        expense_method=ExpenseMethod.FLAT_RATE,
    )
    db_session.add(biz)
    db_session.flush()
    return biz
