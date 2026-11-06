/**
 * npm run import-funds
 *
 * Reads the team's spreadsheet data/funds/real/funds.csv and writes data/funds/real/funds.json,
 * which the web and LINE read next to data/verified/. Figures are copied as written (no rounding),
 * empty cells stay empty ("ไม่พบในเอกสาร"), and every fund is validated against the schema.
 */
import fs from "node:fs";
import path from "node:path";

import { parseCsv } from "../src/lib/csv";
import { rowToFund } from "../src/lib/importFunds";

const DIR = path.join("data", "funds", "real");
const IN = path.join(DIR, "funds.csv");
const OUT = path.join(DIR, "funds.json");

const rows = parseCsv(fs.readFileSync(IN, "utf8"));
const funds = rows.map(rowToFund);
const codes = funds.map((f) => f.code);
const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
if (dupes.length) throw new Error(`รหัสกองซ้ำ: ${dupes.join(", ")}`);

fs.writeFileSync(OUT, JSON.stringify(funds, null, 2) + "\n");
console.log(`นำเข้า ${funds.length} กองจาก ${IN} -> ${OUT}`);
for (const f of funds) {
  const values = [f.fees.frontEnd, f.fees.backEnd, f.fees.switching, f.fees.management, f.fees.ter, f.fees.masterFundExpense, f.risk.fxHedging].filter((v) => v.value !== null);
  const paged = values.filter((v) => v.page !== null).length;
  console.log(`  ${f.code.padEnd(18)} ${f.meta.dataSource?.startsWith("Settrade") ? "ก.ล.ต." : "Factsheet"}  เลขหน้า ${paged}/${values.length}`);
}
