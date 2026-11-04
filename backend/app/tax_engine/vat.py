from decimal import ROUND_HALF_UP, Decimal

from app.tax_engine.rules_loader import TaxRules, load_tax_rules

CENTS = Decimal("0.01")


def _rules(rules: TaxRules | None) -> TaxRules:
    return rules if rules is not None else load_tax_rules()


def vat_threshold_ratio(annual_revenue: Decimal, rules: TaxRules | None = None) -> Decimal:
    if annual_revenue < 0:
        raise ValueError("annual_revenue must not be negative")
    threshold = _rules(rules).vat.annual_threshold
    return (annual_revenue / threshold).quantize(Decimal("0.0001"))


def is_vat_registration_required(annual_revenue: Decimal, rules: TaxRules | None = None) -> bool:
    if annual_revenue < 0:
        raise ValueError("annual_revenue must not be negative")
    return annual_revenue >= _rules(rules).vat.annual_threshold


def vat_warning_level(annual_revenue: Decimal, rules: TaxRules | None = None) -> str | None:
    """Returns the highest warning level reached (e.g. 'near', 'high'), or None."""
    ratio = vat_threshold_ratio(annual_revenue, rules)
    levels = sorted(_rules(rules).vat.warning_levels, key=lambda lvl: lvl.min_ratio)
    reached = [lvl.level for lvl in levels if ratio >= lvl.min_ratio]
    return reached[-1] if reached else None


def calculate_output_vat(amount: Decimal, rules: TaxRules | None = None) -> Decimal:
    if amount < 0:
        raise ValueError("amount must not be negative")
    rate = _rules(rules).vat.rate
    return (amount * rate).quantize(CENTS, rounding=ROUND_HALF_UP)


def calculate_vat_payable(output_vat: Decimal, input_vat: Decimal) -> Decimal:
    """Positive = payable to Revenue Department, negative = refundable."""
    return (output_vat - input_vat).quantize(CENTS, rounding=ROUND_HALF_UP)
