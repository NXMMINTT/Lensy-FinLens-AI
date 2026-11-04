import type { components } from "@/types/api.gen";

type Schemas = components["schemas"];

export type Overview = Schemas["OverviewOut"];

export type TaxMeter = Schemas["TaxMeterOut"];

export type TransactionItem = Schemas["TransactionOut"];

export type ProductItem = Schemas["ProductOut"];

export type TransactionUpdate = Schemas["TransactionUpdateIn"];

export type TransactionCreate = Schemas["TransactionCreateIn"];

export type CategoryOption = Schemas["CategoryOut"];

export type CategoryTotal = Schemas["CategoryTotalOut"];

export type BusinessInfo = Schemas["BusinessOut"];

export type BusinessUpdate = Schemas["BusinessUpdateIn"];

export type EntryType = TransactionItem["type"];

export type ProductCreate = Schemas["ProductCreateIn"];

export type ProductUpdate = Schemas["ProductUpdateIn"];

export type StockAdjust = Schemas["StockAdjustIn"];
