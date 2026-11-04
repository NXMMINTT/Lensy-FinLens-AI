from decimal import Decimal
from functools import lru_cache
from pathlib import Path

import yaml
from pydantic import BaseModel


class VatWarningLevel(BaseModel):
    level: str
    min_ratio: Decimal


class VatRules(BaseModel):
    annual_threshold: Decimal
    rate: Decimal
    warning_levels: list[VatWarningLevel]


class TaxBracket(BaseModel):
    floor: Decimal
    ceiling: Decimal | None
    rate: Decimal


class PersonalIncomeTaxRules(BaseModel):
    flat_rate_expense_ratio: Decimal
    personal_allowance: Decimal
    brackets: list[TaxBracket]


class TaxRules(BaseModel):
    vat: VatRules
    personal_income_tax: PersonalIncomeTaxRules


@lru_cache(maxsize=1)
def load_tax_rules(path: Path | None = None) -> TaxRules:
    if path is None:
        from app.core.settings import settings

        path = settings.tax_rules_path
    with open(path, encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    return TaxRules.model_validate(raw)
