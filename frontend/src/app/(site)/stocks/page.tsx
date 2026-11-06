import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { StocksTable } from "@/components/finlens/stocks/StocksTable";
import { thaiDate } from "@/lib/dataStatus";
import { getStocks, stockAsOfDates } from "@/lib/stocks";

export const metadata: Metadata = {
  title: "ข้อมูลหุ้น | FinLens AI",
  description: "ตัวเลขพื้นฐานของหุ้นไทย 20 ตัว เรียงลำดับและกรองตามกลุ่มอุตสาหกรรมได้ พร้อมคำอธิบายศัพท์ ข้อมูลเพื่อความเข้าใจ",
};

/**
 * Stock figures as the team's file gives them. The page describes data only: it never says what to
 * do with a stock, and has no price targets (words checked in stocksPage.test.ts).
 */
export default function StocksPage() {
  const stocks = getStocks();
  const dates = stockAsOfDates(stocks);
  const sources = [...new Set(stocks.map((s) => s.sourceUrl).filter(Boolean))];

  return (
    <AppShell sampleNote={false}>
      <PageHeader
        label="ข้อมูลหุ้น"
        title="ตัวเลขพื้นฐานหุ้นไทย"
        mark="อ่านให้เข้าใจ"
        text="ดูราคาปิด มูลค่าตลาด P/E P/BV ปันผล และ Beta เคียงกัน เรียงลำดับหรือกรองตามกลุ่มอุตสาหกรรมได้ ไม่เข้าใจศัพท์ตัวไหน กดปุ่มอธิบายศัพท์ได้เลยค่ะ"
        pose="chart"
      />

      {/* the date, large: market data changes every day */}
      <section aria-label="วันที่ของข้อมูล" className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[20px] border-2 border-sun/60 bg-sun-soft px-5 py-4">
        <span className="flex flex-col">
          <span className="text-[14px] font-semibold text-sun-ink">ข้อมูล ณ วันที่</span>
          <b className="font-heading text-[26px] leading-tight text-ink md:text-[30px]">{dates.length ? dates.map(thaiDate).join(", ") : "ไม่พบในเอกสาร"}</b>
        </span>
        <span className="max-w-[640px] text-[14.5px] text-ink-body">
          ข้อมูลตลาด ณ สิ้นวันทำการ ตัวเลขเปลี่ยนทุกวัน ราคาและอัตราส่วนวันนี้อาจต่างจากตารางนี้ P/E และ P/BV คำนวณจากงบการเงินล่าสุดตามที่ตลาดหลักทรัพย์ฯ เผยแพร่
        </span>
      </section>

      {stocks.length === 0 ? <p className="m-0 rounded-2xl border border-line bg-surface p-6">ยังไม่มีข้อมูลหุ้นค่ะ</p> : <StocksTable stocks={stocks} />}

      <section aria-labelledby="stock-sources" className="flex flex-col gap-1 text-[13.5px] text-ink-muted">
        <h2 id="stock-sources" className="m-0 text-[15px] font-bold text-ink">
          ที่มาของข้อมูล
        </h2>
        <p className="m-0">Settrade (ตลาดหลักทรัพย์แห่งประเทศไทย) หน้าภาพรวมของแต่ละหุ้น {sources.length > 0 && `เช่น ${sources[0]}`}</p>
        <p className="m-0">ตัวเลขแสดงตามไฟล์ข้อมูลโดยไม่ปัดเศษ ช่องที่ไม่มีข้อมูลแสดงว่า &ldquo;ไม่พบในเอกสาร&rdquo;</p>
      </section>
    </AppShell>
  );
}
