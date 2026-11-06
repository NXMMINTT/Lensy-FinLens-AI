import { homeFunds, MASTER_COST_NOTE } from "@/lib/homeFunds";
import { docPct, pct } from "@/lib/money";
import type { DocSource } from "@/lib/schema";
import { SOURCE_LABEL, sourceRef } from "@/lib/sources";

import { Icon } from "../Icon";
import { Lensy } from "../Lensy";

/** Grey placeholder text lines on a document page. */
function Lines({ widths }: { widths: number[] }) {
  return (
    <div className="flex flex-col gap-[6px]" aria-hidden="true">
      {widths.map((w, i) => (
        <span key={i} className="h-[5px] rounded-full bg-[#E3E9E5]" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function PageFooter({ page, source }: { page: number | null; source: DocSource }) {
  return (
    <div className="mt-auto flex justify-between border-t border-[#E3E9E5] pt-1.5 text-[10px] text-[#7A8C81]">
      <span>{SOURCE_LABEL[source]}</span>
      <span>{page !== null ? `หน้า ${page}` : ""}</span>
    </div>
  );
}

/**
 * Hero illustration with real data: fund A's Thai factsheet in front, its master fund's own document
 * behind it, and Lensy's magnifier over the master fund cost the Thai factsheet leaves out. The two
 * yearly totals at the bottom are the only place the home page shows them.
 */
export function DocumentLens() {
  const [A, B] = homeFunds();
  const master = A.masterFundExpense!;
  return (
    <figure
      className="force-light relative m-0 aspect-[480/460] w-full max-w-[480px] select-none text-[#16301F]"
      aria-label={`ภาพจากข้อมูลจริง: ${A.nameTh} ค่าใช้จ่ายกองไทย (TER) ${docPct(A.ter.value)} จาก ${sourceRef(A.ter.page, A.ter.source)} ส่วนค่าใช้จ่ายกองหลัก ${docPct(master.value)} จาก ${sourceRef(master.page, master.source)} ต้นทุนต่อปีรวม ${A.code} ${pct(A.annualCostRate)} ${B.code} ${pct(B.annualCostRate)}`}
    >
      {/* the master fund's own document (behind) */}
      <div className="absolute right-[2%] top-0 flex h-[74%] w-[60%] rotate-[4deg] flex-col gap-2 rounded-xl border border-[#DCE5DF] bg-white p-[4%] shadow-[0_18px_40px_rgba(20,46,34,.14)]">
        <b className="text-[12px]">{SOURCE_LABEL[master.source]}</b>
        <Lines widths={[92, 80, 88, 60]} />
        <div className="text-[11px] leading-snug">
          ค่าใช้จ่ายกองหลัก
          <br />
          <span className="marker font-bold">{docPct(master.value)} ต่อปี</span>
        </div>
        <Lines widths={[85, 90, 70, 88, 50]} />
        <PageFooter page={master.page} source={master.source} />
      </div>

      {/* the Thai fund's factsheet (front) */}
      <div className="absolute bottom-[4%] left-0 flex h-[74%] w-[62%] -rotate-[3deg] flex-col gap-2 rounded-xl border border-[#DCE5DF] bg-white p-[4%] shadow-[0_22px_44px_rgba(20,46,34,.18)]">
        <b className="text-[12px]">Fund Factsheet · {A.code}</b>
        <span className="text-[10.5px] leading-snug text-[#4A5E52]">{A.nameTh}</span>
        <Lines widths={[90, 74]} />
        <table className="w-full border-collapse text-[10.5px]">
          <tbody>
            <tr className="border-b border-[#EEF2EF]">
              <td className="py-1">ค่าธรรมเนียมการขาย</td>
              <td className="py-1 text-right font-semibold">{A.frontEnd ? docPct(A.frontEnd.value) : "ไม่พบในเอกสาร"}</td>
            </tr>
            <tr className="border-b border-[#EEF2EF]">
              <td className="py-1">ค่าธรรมเนียมรับซื้อคืน</td>
              <td className="py-1 text-right font-semibold">{A.backEnd ? docPct(A.backEnd.value) : "ไม่พบในเอกสาร"}</td>
            </tr>
            <tr>
              <td className="py-1">ค่าใช้จ่ายรวม (TER)</td>
              <td className="py-1 text-right">
                <span className="marker-green font-bold">{docPct(A.ter.value)}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <Lines widths={[88, 64, 80]} />
        <PageFooter page={A.ter.page} source={A.ter.source} />
      </div>

      {/* magnifier over the cost the factsheet leaves out */}
      <div className="absolute right-[6%] top-[14%] h-[30%] w-[30%]">
        <div className="relative flex h-full w-full items-center justify-center rounded-full border-[7px] border-[#135C2A] bg-white/80 shadow-[0_10px_30px_rgba(19,92,42,.35)] backdrop-blur-[1px]">
          <span className="text-center leading-tight">
            <span className="block text-[10px] text-[#4A5E52]">กองหลัก</span>
            <span className="marker text-[20px] font-extrabold">{docPct(master.value)}</span>
          </span>
          <span className="absolute -bottom-[34%] -right-[22%] h-[44%] w-[13%] -rotate-45 rounded-full bg-[#135C2A]" aria-hidden="true" />
        </div>
      </div>

      {/* callout */}
      <div className="absolute right-0 top-[47%] max-w-[37%] rounded-xl max-sm:hidden bg-[#FFF4D1] px-2.5 py-1.5 text-[10.5px] font-semibold leading-snug text-[#7A5200] shadow-sm">
        <Icon name="warn" className="mr-1" />
        {MASTER_COST_NOTE}
      </div>

      {/* result: the two real funds side by side */}
      <div className="absolute -bottom-[2%] right-[0%] flex flex-col gap-1 rounded-2xl bg-[#1A7637] px-3.5 py-2.5 text-white shadow-[0_12px_28px_rgba(26,118,55,.35)]">
        <span className="text-[11px] opacity-90">ต้นทุนต่อปีรวม เทียบ 2 กอง</span>
        {[A, B].map((f) => (
          <span key={f.code} className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] opacity-90">{f.code}</span>
            <span className="text-[22px] font-extrabold leading-none">{pct(f.annualCostRate)}</span>
          </span>
        ))}
        <span className="max-w-[190px] text-[10px] leading-snug opacity-90">
          รวมค่าใช้จ่ายกองหลักแล้ว{A.masterInclusionUnknown || B.masterInclusionUnknown ? " (เอกสารไม่ระบุว่า TER รวมไว้แล้วหรือไม่ จึงบวกเพิ่ม)" : ""}
        </span>
      </div>

      <Lensy pose="magnifier" size={150} className="absolute -left-[6%] -top-[8%] animate-bob max-sm:!h-[96px] max-sm:!w-[96px]" />
    </figure>
  );
}
