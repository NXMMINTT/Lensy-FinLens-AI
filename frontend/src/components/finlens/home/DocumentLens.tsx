import { pct, SAMPLE_ACTIVE as F, sampleAnnualCost, SOURCE_LABEL } from "@/lib/sampleFunds";

import { Lensy } from "../Lensy";
import { SampleBadge } from "../SampleBadge";

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

function PageFooter({ page, source }: { page: number; source: "factsheet" | "prospectus" }) {
  return (
    <div className="mt-auto flex justify-between border-t border-[#E3E9E5] pt-1.5 text-[10px] text-[#7A8C81]">
      <span>{SOURCE_LABEL[source]}</span>
      <span>หน้า {page}</span>
    </div>
  );
}

/**
 * Hero illustration: a Factsheet page in front, the prospectus behind it, and Lensy's magnifier
 * over the master fund expense that only the prospectus mentions. Values come from the sample fund.
 */
export function DocumentLens() {
  const master = F.masterFundExpense!;
  return (
    <figure
      className="force-light relative m-0 aspect-[480/460] w-full max-w-[480px] select-none text-[#16301F]"
      aria-label={`ภาพตัวอย่าง: ค่าใช้จ่ายกองไทย ${pct(F.ter.value)} อยู่ใน Factsheet หน้า ${F.ter.page} ส่วนค่าใช้จ่ายกองหลัก ${pct(master.value)} อยู่ในหนังสือชี้ชวนหน้า ${master.page}`}
    >
      {/* prospectus (behind) */}
      <div className="absolute right-[2%] top-0 flex h-[74%] w-[60%] rotate-[4deg] flex-col gap-2 rounded-xl border border-[#DCE5DF] bg-white p-[4%] shadow-[0_18px_40px_rgba(20,46,34,.14)]">
        <b className="text-[12px]">หนังสือชี้ชวน</b>
        <Lines widths={[92, 80, 88, 60]} />
        <div className="text-[11px] leading-snug">
          ค่าใช้จ่ายกองหลัก
          <br />
          <span className="marker font-bold">{pct(master.value)} ต่อปี</span>
        </div>
        <Lines widths={[85, 90, 70, 88, 50]} />
        <PageFooter page={master.page} source={master.source} />
      </div>

      {/* factsheet (front) */}
      <div className="absolute bottom-[4%] left-0 flex h-[74%] w-[62%] -rotate-[3deg] flex-col gap-2 rounded-xl border border-[#DCE5DF] bg-white p-[4%] shadow-[0_22px_44px_rgba(20,46,34,.18)]">
        <div className="flex items-center justify-between gap-1">
          <b className="text-[12px]">Fund Factsheet</b>
          <SampleBadge className="!px-1.5 !text-[9px]" />
        </div>
        <span className="text-[10.5px] text-[#4A5E52]">{F.nameTh}</span>
        <Lines widths={[90, 74]} />
        <table className="w-full border-collapse text-[10.5px]">
          <tbody>
            <tr className="border-b border-[#EEF2EF]">
              <td className="py-1">ค่าธรรมเนียมการขาย</td>
              <td className="py-1 text-right font-semibold">{pct(F.frontEnd.value)}</td>
            </tr>
            <tr className="border-b border-[#EEF2EF]">
              <td className="py-1">ค่าธรรมเนียมรับซื้อคืน</td>
              <td className="py-1 text-right font-semibold">{pct(F.backEnd.value)}</td>
            </tr>
            <tr>
              <td className="py-1">ค่าใช้จ่ายรวม (TER)</td>
              <td className="py-1 text-right">
                <span className="marker-green font-bold">{pct(F.ter.value)}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <Lines widths={[88, 64, 80]} />
        <PageFooter page={F.ter.page} source={F.ter.source} />
      </div>

      {/* magnifier over the hidden cost */}
      <div className="absolute right-[6%] top-[14%] h-[30%] w-[30%]">
        <div className="relative flex h-full w-full items-center justify-center rounded-full border-[7px] border-[#135C2A] bg-white/80 shadow-[0_10px_30px_rgba(19,92,42,.35)] backdrop-blur-[1px]">
          <span className="text-center leading-tight">
            <span className="block text-[10px] text-[#4A5E52]">กองหลัก</span>
            <span className="marker text-[22px] font-extrabold">{pct(master.value)}</span>
          </span>
          <span className="absolute -bottom-[34%] -right-[22%] h-[44%] w-[13%] -rotate-45 rounded-full bg-[#135C2A]" aria-hidden="true" />
        </div>
      </div>

      {/* callout */}
      <div className="absolute right-0 top-[47%] max-w-[35%] rounded-xl bg-[#FFF4D1] px-2.5 py-1.5 text-[11px] font-semibold leading-snug text-[#7A5200] shadow-sm">
        ⚠ ซ่อนอยู่ในหนังสือชี้ชวน หน้า {master.page} ไม่อยู่ใน Factsheet
      </div>

      {/* result */}
      <div className="absolute -bottom-[2%] right-[2%] flex flex-col rounded-2xl bg-[#1A7637] px-3.5 py-2 text-white shadow-[0_12px_28px_rgba(26,118,55,.35)]">
        <span className="text-[11px] opacity-90">ต้นทุนต่อปีรวม</span>
        <span className="text-[24px] font-extrabold leading-none">{pct(sampleAnnualCost(F))}</span>
        <span className="mt-0.5 text-[10px] opacity-90">
          หน้า {F.ter.page} + หน้า {master.page}
        </span>
      </div>

      <Lensy pose="magnifier" size={110} className="absolute -left-[4%] -top-[4%] animate-bob max-sm:!h-[80px] max-sm:!w-[80px]" />
    </figure>
  );
}
