import type { Metadata } from "next";

import { AppShell } from "@/components/finlens/app/AppShell";
import { PageHeader } from "@/components/finlens/app/PageHeader";
import { ComparePicker } from "@/components/finlens/compare/ComparePicker";
import { CompareTool } from "@/components/finlens/compare/CompareTool";
import { TopicCompare } from "@/components/finlens/compare/TopicCompare";
import { pickInitialCodes, toCompareFund } from "@/lib/compare";
import { getVerifiedFunds } from "@/lib/funds";
import { MAX_COMPARE_FUNDS } from "@/lib/limits";
import { REFERENCE, toRefCompare } from "@/lib/reference";

export const metadata: Metadata = {
  title: "เทียบ | FinLens AI",
  description:
    "เทียบกองทุนหรือหัวข้อการลงทุนเคียงกัน ค่าธรรมเนียมทุกชั้นของกอง และตัวเลขล่าสุด ความเสี่ยง แหล่งที่มาของแต่ละหัวข้อ ทุกตัวเลขบอกที่มา ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน",
};

type Search = { funds?: string; cat?: string; topics?: string };

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { funds: fundsParam, cat: catParam, topics } = await searchParams;
  const funds = getVerifiedFunds().map(toCompareFund);
  const checked = REFERENCE.map((c) => ({
    ...c,
    items: c.items.filter((i) => i.status !== "unchecked"),
  })).filter((c) => c.items.length >= 2);
  const cat = checked.find((c) => String(c.num) === catParam);

  return (
    <AppShell sampleNote={!cat && funds.some((f) => f.isSample)}>
      <PageHeader
        label="เทียบ"
        title={cat ? `เทียบ${cat.title}เคียงกัน` : "เทียบกองทุนเคียงกัน"}
        mark={cat ? "เห็นตัวเลขและความเสี่ยง" : "เห็นค่าธรรมเนียมแฝง"}
        text={
          cat
            ? "เลือกหัวข้อในหมวดเดียวกันมาวางเทียบ เห็นตัวเลขล่าสุด วันที่ ความเสี่ยง และสถานะการตรวจสอบทีละบรรทัด"
            : "วางค่าธรรมเนียมทุกชั้นเทียบกันทีละบรรทัด ชั้นที่ Factsheet ไม่ได้แสดงจะมีป้ายเตือน และทุกตัวเลขบอกที่มา เลือกหมวดอื่นจากเมนูเพื่อเทียบหัวข้อการลงทุนอื่นได้"
        }
        pose="magnifier"
      />

      <div className="flex flex-col gap-6">
        {/* what to compare: funds or one reference group */}
        <ComparePicker
          cat={cat ? cat.num : null}
          fundsCount={funds.length}
          groups={checked.map((c) => ({
            num: c.num,
            title: c.title,
            count: c.items.length,
          }))}
        />

        <div className="min-w-0">
          {cat ? (
            <TopicCompare
              key={cat.num}
              catNum={cat.num}
              catTitle={cat.title}
              items={cat.items.map(toRefCompare)}
              initialIds={(topics ?? "")
                .split(",")
                .filter((id) => cat.items.some((i) => i.id === id))
                .slice(0, MAX_COMPARE_FUNDS)}
            />
          ) : funds.length < 2 ? (
            <p className="m-0 rounded-2xl border border-line bg-surface p-6">
              ยังมีข้อมูลกองทุนที่ตรวจแล้วไม่ถึง 2 กอง จึงยังเทียบไม่ได้
            </p>
          ) : (
            <CompareTool
              funds={funds}
              initialCodes={
                fundsParam ? pickInitialCodes(funds, fundsParam) : []
              }
              mode="fees"
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
