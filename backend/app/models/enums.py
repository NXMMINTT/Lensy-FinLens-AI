import enum


class TaxStatus(str, enum.Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"


class ExpenseMethod(str, enum.Enum):
    FLAT_RATE = "flat_rate"
    ACTUAL = "actual"


class IncomeExpenseType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class TransactionSource(str, enum.Enum):
    TEXT = "text"
    VOICE = "voice"
    IMAGE = "image"
    WEB = "web"


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
