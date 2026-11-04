from decimal import ROUND_HALF_UP, Decimal

from app.models.enums import ExpenseMethod
from app.tax_engine.rules_loader import TaxRules, load_tax_rules

CENTS = Decimal("0.01")


def _rules(rules: TaxRules | None) -> TaxRules:
    return rules if rules is not None else load_tax_rules()


def calculate_deductible_expense(
    gross_income: Decimal,
    method: ExpenseMethod,
    actual_expense: Decimal | None = None,
    rules: TaxRules | None = None,
) -> Decimal:
    if gross_income < 0:
        raise ValueError("gross_income must not be negative")

    if method == ExpenseMethod.FLAT_RATE:
        ratio = _rules(rules).personal_income_tax.flat_rate_expense_ratio
        return (gross_income * ratio).quantize(CENTS, rounding=ROUND_HALF_UP)

    if method == ExpenseMethod.ACTUAL:
        if actual_expense is None:
            raise ValueError("actual_expense is required when method is 'actual'")
        if actual_expense < 0:
            raise ValueError("actual_expense must not be negative")
        return actual_expense.quantize(CENTS, rounding=ROUND_HALF_UP)

    raise ValueError(f"unsupported expense method: {method}")


def calculate_taxable_income(
    gross_income: Decimal,
    deductible_expense: Decimal,
    rules: TaxRules | None = None,
) -> Decimal:
    allowance = _rules(rules).personal_income_tax.personal_allowance
    taxable = gross_income - deductible_expense - allowance
    return max(taxable, Decimal("0")).quantize(CENTS, rounding=ROUND_HALF_UP)


def calculate_progressive_tax(taxable_income: Decimal, rules: TaxRules | None = None) -> Decimal:
    if taxable_income < 0:
        raise ValueError("taxable_income must not be negative")

    brackets = _rules(rules).personal_income_tax.brackets
    total = Decimal("0")
    for bracket in brackets:
        if taxable_income <= bracket.floor:
            break
        ceiling = bracket.ceiling if bracket.ceiling is not None else taxable_income
        portion = min(taxable_income, ceiling) - bracket.floor
        if portion > 0:
            total += portion * bracket.rate
    return total.quantize(CENTS, rounding=ROUND_HALF_UP)


def calculate_personal_income_tax(
    gross_income: Decimal,
    method: ExpenseMethod,
    actual_expense: Decimal | None = None,
    rules: TaxRules | None = None,
) -> Decimal:
    rules_ = _rules(rules)
    expense = calculate_deductible_expense(gross_income, method, actual_expense, rules_)
    taxable_income = calculate_taxable_income(gross_income, expense, rules_)
    return calculate_progressive_tax(taxable_income, rules_)
