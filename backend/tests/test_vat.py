from decimal import Decimal

import pytest

from app.tax_engine import vat


def test_vat_threshold_ratio_half():
    assert vat.vat_threshold_ratio(Decimal("900000")) == Decimal("0.5000")


def test_vat_threshold_ratio_zero_revenue():
    assert vat.vat_threshold_ratio(Decimal("0")) == Decimal("0.0000")


def test_vat_threshold_ratio_negative_raises():
    with pytest.raises(ValueError):
        vat.vat_threshold_ratio(Decimal("-1"))


def test_is_vat_registration_required_below_threshold():
    assert vat.is_vat_registration_required(Decimal("1799999.99")) is False


def test_is_vat_registration_required_exactly_at_threshold():
    assert vat.is_vat_registration_required(Decimal("1800000")) is True


def test_is_vat_registration_required_above_threshold():
    assert vat.is_vat_registration_required(Decimal("2000000")) is True


def test_vat_warning_level_below_near():
    assert vat.vat_warning_level(Decimal("1000000")) is None


def test_vat_warning_level_at_near_boundary():
    assert vat.vat_warning_level(Decimal("1440000")) == "near"  # 80% of 1.8M


def test_vat_warning_level_at_high_boundary():
    assert vat.vat_warning_level(Decimal("1620000")) == "high"  # 90% of 1.8M


def test_vat_warning_level_above_threshold():
    assert vat.vat_warning_level(Decimal("2000000")) == "high"


def test_calculate_output_vat():
    assert vat.calculate_output_vat(Decimal("1000")) == Decimal("70.00")


def test_calculate_output_vat_zero():
    assert vat.calculate_output_vat(Decimal("0")) == Decimal("0.00")


def test_calculate_output_vat_negative_raises():
    with pytest.raises(ValueError):
        vat.calculate_output_vat(Decimal("-1"))


def test_calculate_vat_payable_positive():
    assert vat.calculate_vat_payable(Decimal("700"), Decimal("300")) == Decimal("400.00")


def test_calculate_vat_payable_refund():
    assert vat.calculate_vat_payable(Decimal("100"), Decimal("300")) == Decimal("-200.00")
