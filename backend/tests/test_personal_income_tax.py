from decimal import Decimal

import pytest

from app.models.enums import ExpenseMethod
from app.tax_engine import personal_income_tax as pit


def test_deductible_expense_flat_rate():
    expense = pit.calculate_deductible_expense(Decimal("500000"), ExpenseMethod.FLAT_RATE)
    assert expense == Decimal("300000.00")


def test_deductible_expense_actual():
    expense = pit.calculate_deductible_expense(
        Decimal("500000"), ExpenseMethod.ACTUAL, actual_expense=Decimal("120000")
    )
    assert expense == Decimal("120000.00")


def test_deductible_expense_actual_requires_amount():
    with pytest.raises(ValueError):
        pit.calculate_deductible_expense(Decimal("500000"), ExpenseMethod.ACTUAL)


def test_deductible_expense_negative_income_raises():
    with pytest.raises(ValueError):
        pit.calculate_deductible_expense(Decimal("-1"), ExpenseMethod.FLAT_RATE)


def test_taxable_income_floors_at_zero():
    taxable = pit.calculate_taxable_income(Decimal("50000"), Decimal("30000"))
    assert taxable == Decimal("0.00")


def test_taxable_income_zero_gross_income():
    taxable = pit.calculate_taxable_income(Decimal("0"), Decimal("0"))
    assert taxable == Decimal("0.00")


def test_progressive_tax_exempt_bracket():
    assert pit.calculate_progressive_tax(Decimal("150000")) == Decimal("0.00")


def test_progressive_tax_at_second_bracket_boundary():
    assert pit.calculate_progressive_tax(Decimal("300000")) == Decimal("7500.00")


def test_progressive_tax_spans_multiple_brackets():
    assert pit.calculate_progressive_tax(Decimal("1200000")) == Decimal("165000.00")


def test_progressive_tax_negative_raises():
    with pytest.raises(ValueError):
        pit.calculate_progressive_tax(Decimal("-1"))


def test_calculate_personal_income_tax_flat_rate_pipeline():
    # gross 500,000 -> expense 300,000 (flat) -> taxable 140,000 (after 60,000 allowance) -> exempt bracket
    tax = pit.calculate_personal_income_tax(Decimal("500000"), ExpenseMethod.FLAT_RATE)
    assert tax == Decimal("0.00")


def test_calculate_personal_income_tax_actual_method_pipeline():
    # gross 1,000,000 - actual expense 200,000 - allowance 60,000 = taxable 740,000
    tax = pit.calculate_personal_income_tax(
        Decimal("1000000"), ExpenseMethod.ACTUAL, actual_expense=Decimal("200000")
    )
    # 0 + 150000*.05 + 200000*.10 + 240000*.15 = 7500 + 20000 + 36000 = 63500
    assert tax == Decimal("63500.00")
