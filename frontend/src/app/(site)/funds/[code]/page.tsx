import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/finlens/app/AppShell";
import { DataStatusBadge } from "@/components/finlens/app/DataStatusBadge";
import { Card, RiskBadge, RiskMeter, SourceChip } from "@/components/finlens/app/ui";
import { Disclaimer } from "@/components/finlens/Disclaimer";
import { Icon } from "@/components/finlens/Icon";
import { Lensy } from "@/components/finlens/Lensy";
import { SampleBadge } from "@/components/finlens/SampleBadge";
import { toCompareFund } from "@/lib/compare";
import { fundDataStatus } from "@/lib/dataStatus";
import { NOT_FOUND, NOT_IN_DOCS } from "@/lib/disclaimer";
import { SOURCE_LABEL, sourceRef } from "@/lib/sources";
import { getFund, getVerifiedFunds } from "@/lib/funds";
import { baht, docPct, pct } from "@/lib/money";
import { riskAlerts, RISK_TOPIC_LABEL } from "@/lib/riskRules";
import { pctToRate, type ReturnPeriod, type Sourced } from "@/lib/schema";

type Props = { params: Promise<{ code: string }> };

export function generateStaticParams() {
  return getVerifiedFunds().map((f) => ({ code: f.code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = getFund(decodeURIComponent((await params).code));
  return { title: f ? `${f.nameTh.value ?? f.code} | FinLens AI` : "ไม่พบกองทุน | FinLens AI" };
}

const PERIOD_LABEL: Record<ReturnPeriod, string> = {
  ytd: "ตั้งแต่ต้นปี",
  "3m": "3 เดือน",
  "6m": "6 เดือน",
  "1y": "1 ปี",
  "3y": "3 ปี (ต่อปี)",
  "5y": "5 ปี (ต่อปี)",
  "10y": "10 ปี (ต่อปี)",
  sinceInception: "ตั้งแต่จัดตั้ง",
};

/** The page tag, or just where it came from when there is no page yet (e.g. SEC data). */
function Chip<T>({ s }: { s: Sourced<T> }) {
  if (s.page !== null) return <SourceChip page={s.page} source={s.source} quote={s.quote} />;
  if (s.value === null) return null;
  return <span className="inline-flex rounded-md bg-sun-soft px-1.5 py-0.5 text-[12px] text-sun-ink">{sourceRef(null, s.source)} · ยังไม่มีเลขหน้า</span>;
}

function Value<T>({ s, render }: { s: Sourced<T>; render: (v: T) => React.ReactNode }) {
  if (s.value === null) return <span className="text-[14px] text-ink-muted">{NOT_IN_DOCS}</span>;
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <b className="text-ink">{render(s.value)}</b>
      <Chip s={s} />
    </span>
  );
}

const SEGMENT_COLORS = ["bg-brand", "bg-sun", "bg-sky-deep"];

export default async function FundPage({ params }: Props) {
  const f = getFund(decodeURIComponent((await params).code));
  if (!f) notFound();

  const c = toCompareFund(f);
  const alerts = riskAlerts(f);
  const name = f.nameTh.value ?? f.code;
  const total = c.annualCostRate;
  const master = f.fees.masterFundExpense;
  const addMaster = master.value !== null && f.fees.terIncludesMasterFund.value !== true;
  const yearly = [
    { label: "ค่าใช้จ่ายรวมของกองนี้ (TER)", s: f.fees.ter, include: true },
    { label: "ค่าใช้จ่ายของกองทุนหลัก", s: master, include: addMaster },
  ].filter((x) => x.s.value !== null && x.include);
  const otherCode = getVerifiedFunds().find((x) => x.code !== f.code)?.code;

  return (
    <AppShell sampleNote={f.meta.isSample}>
      <nav aria-label="breadcrumb" className="text-[14px] text-ink-muted">
        <Link href="/explain" className="text-ink-muted no-underline hover:text-brand">
          ดูทีละกอง
        </Link>{" "}
        / <span className="text-ink-body">{f.code}</span>
      </nav>

      {/* header */}
      <header className="flex flex-wrap items-start justify-between gap-5 rounded-[28px] border border-line bg-surface p-5 md:p-7">
        <div className="flex min-w-0 max-w-[700px] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
            <span className="font-semibold">{f.code}</span>
            {f.isFeeder.value && <span className="rounded-md bg-sky px-1.5 py-0.5 text-[11px] font-semibold text-ink-body">Feeder Fund</span>}
            {f.meta.isSample && <SampleBadge />}
          </div>
          <h1 className="m-0 text-[28px] font-bold leading-tight md:text-[36px]">{name}</h1>
          <p className="m-0 text-ink-body">{[f.amc.value, f.type.value].filter(Boolean).join(" · ")}</p>
          {f.masterFundName.value && (
            <div className="m-0 flex flex-wrap items-center gap-2 text-[15px] text-ink-body">
              กองทุนหลัก: <b>{f.masterFundName.value}</b> <Chip s={f.masterFundName} />
            </div>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-ink-muted">ระดับความเสี่ยง</span>
              {f.riskLevel.value !== null ? <RiskMeter level={f.riskLevel.value} /> : <span className="text-ink-muted">{NOT_FOUND}</span>}
              <Chip s={f.riskLevel} />
            </span>
          </div>
          <div className="mt-1">
            <DataStatusBadge status={fundDataStatus(f)} />
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Link
            href={`/chat?fund=${encodeURIComponent(f.code)}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand px-5 font-bold text-white no-underline hover:bg-brand-dark"
          >
            ถามน้อง Lensy เรื่องกองนี้
          </Link>
          <Link
            href={`/compare?funds=${encodeURIComponent([f.code, otherCode].filter(Boolean).join(","))}`}
            className="inline-flex min-h-[44px] items-center rounded-full border-2 border-brand px-5 font-bold text-brand no-underline hover:bg-brand-soft"
          >
            เทียบค่าธรรมเนียมกับกองอื่น
          </Link>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Hidden Fee Detector */}
        <Card id="fees">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[13px] font-bold uppercase tracking-wider text-brand">Hidden Fee Detector</span>
              <h2 className="m-0 text-[22px] font-bold">ค่าใช้จ่ายทุกชั้น</h2>
            </div>
            <Lensy pose="magnifier" size={64} />
          </div>

          <div className="mt-4 rounded-2xl bg-brand-tint p-4">
            <div className="text-[14px] text-ink-muted">ต้นทุนต่อปีรวม</div>
            {total === null ? (
              <p className="m-0 text-ink-body">{NOT_FOUND} (ค่าใช้จ่ายรวมของกอง) จึงรวมไม่ได้</p>
            ) : (
              <>
                <div className="font-heading text-[44px] font-bold leading-none text-brand">{pct(total)}</div>
                <div className="mt-3 flex h-4 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={yearly.map((y) => `${y.label} ${y.s.value}%`).join(", ")}>
                  {yearly.map((y, i) => (
                    <span key={y.label} className={`${SEGMENT_COLORS[i]} first:rounded-l-full last:rounded-r-full`} style={{ width: `${(pctToRate(y.s.value!) / total) * 100}%` }} />
                  ))}
                </div>
                <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0 text-[14.5px]">
                  {yearly.map((y, i) => (
                    <li key={y.label} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <i className={`inline-block h-2.5 w-2.5 rounded-full ${SEGMENT_COLORS[i]}`} aria-hidden="true" />
                      {y.label} <b>{docPct(y.s.value!)}</b> <Chip s={y.s} />
                    </li>
                  ))}
                </ul>
                <p className="m-0 mt-3 text-[14px] text-ink-body">
                  ทุก ๆ 100,000 บาท เสียค่าใช้จ่ายรายปีราว <b className="text-ink">{baht(100_000 * total)}</b> ต่อปี
                  <span className="text-ink-muted"> (คิดจากเงินต้น ไม่รวมผลตอบแทน คำนวณด้วยสูตร)</span>
                </p>
              </>
            )}
          </div>

          {master.value !== null && master.source === "prospectus" && (
            <p className="m-0 mt-3 rounded-xl bg-sun-soft px-3 py-2 text-[14px] text-sun-ink">
              <b><Icon name="warn" className="mr-1" />ค่าใช้จ่ายของกองทุนหลักอยู่ในหนังสือชี้ชวน ไม่อยู่ใน Factsheet</b> ถ้าดูแค่ Factsheet จะเห็นค่าใช้จ่ายไม่ครบ
            </p>
          )}
          {c.masterInclusionUnknown && (
            <p className="m-0 mt-2 text-[13.5px] text-ink-muted">เอกสารไม่ระบุว่า TER รวมค่าใช้จ่ายของกองทุนหลักแล้วหรือไม่ ตัวเลขรวมนี้ถือว่ายังไม่รวม</p>
          )}

          <h3 className="m-0 mt-5 text-[16px] font-bold">ค่าธรรมเนียมทุกรายการ</h3>
          <ul className="m-0 mt-2 flex list-none flex-col p-0">
            {c.layers.map((l) => (
              <li key={l.key} className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle py-2.5 last:border-0">
                <span className="text-[14.5px] text-ink-body">
                  {l.label} <span className="text-[12px] text-ink-faint">({l.unit})</span>
                </span>
                <Value s={l.item} render={(v) => docPct(v)} />
              </li>
            ))}
          </ul>
          <Link href={`/calculator?funds=${encodeURIComponent(f.code)}`} className="mt-3 inline-block font-bold text-brand underline-offset-4 hover:underline">
            ดูเป็นเงินบาทตามจำนวนปี →
          </Link>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Risk Alert */}
          <Card id="risks">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[13px] font-bold uppercase tracking-wider text-brand">Risk Alert</span>
                <h2 className="m-0 text-[22px] font-bold">ความเสี่ยงที่อาจถูกมองข้าม</h2>
              </div>
              <Lensy pose="checklist" size={64} />
            </div>
            {alerts.length === 0 ? (
              <p className="m-0 mt-3 text-ink-body">ไม่พบข้อมูลที่เข้าเกณฑ์แจ้งเตือนในเอกสาร</p>
            ) : (
              <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
                {alerts.map((a) => (
                  <li key={a.id} className="flex flex-col gap-1.5 rounded-2xl border border-line p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <RiskBadge level={a.level} />
                      <span className="text-[13px] font-semibold text-ink-muted">{RISK_TOPIC_LABEL[a.topic]}</span>
                    </div>
                    <b className="text-[16px] text-ink">{a.title}</b>
                    <span className="text-[14.5px] text-ink-body">{a.detail}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {a.refs.map((r) => (
                        <SourceChip key={`${r.source}${r.page}${r.label}`} page={r.page} source={r.source} quote={r.quote} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="m-0 mt-3 text-[13px] text-ink-muted">ป้ายระดับมาจากกฎที่ตั้งไว้ล่วงหน้า ไม่ได้ให้ AI ตัดสิน และไม่ได้บอกว่ากองดีหรือไม่ดี</p>
          </Card>

          {/* redemption */}
          <Card id="redemption">
            <h2 className="m-0 text-[20px] font-bold">การขายคืน</h2>
            <dl className="m-0 mt-2 flex flex-col">
              {[
                { k: "วันที่ขายคืนได้", v: <Value s={f.redemption.frequency} render={(v) => v} /> },
                { k: "ได้รับเงินหลังขาย", v: <Value s={f.redemption.settlementDays} render={(v) => `${v} วันทำการ (T+${v})`} /> },
                { k: "เงื่อนไข / ระยะห้ามขาย", v: <Value s={f.redemption.lockUp} render={(v) => v} /> },
              ].map((row) => (
                <div key={row.k} className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle py-2.5 last:border-0">
                  <dt className="text-[14.5px] text-ink-body">{row.k}</dt>
                  <dd className="m-0">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      {/* past returns */}
      <Card id="returns">
        <h2 className="m-0 text-[20px] font-bold">ผลตอบแทนย้อนหลังตามที่เอกสารระบุ</h2>
        <p className="m-0 mt-1 text-[14px] text-ink-muted">ผลการดำเนินงานในอดีตไม่ได้เป็นสิ่งยืนยันผลการดำเนินงานในอนาคต ใช้ดูอย่างเดียว ไม่ได้ใช้คำนวณหรือคาดการณ์</p>
        {f.pastReturns.length === 0 ? (
          <p className="m-0 mt-3 text-ink-body">{NOT_FOUND}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-left text-[14.5px]">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="p-2.5 font-semibold">ช่วงเวลา</th>
                  <th className="p-2.5 font-semibold">กองทุน</th>
                  <th className="p-2.5 font-semibold">ตัวชี้วัด</th>
                </tr>
              </thead>
              <tbody>
                {f.pastReturns.map((r) => (
                  <tr key={r.period} className="border-b border-line-subtle last:border-0">
                    <td className="p-2.5 text-ink-body">{PERIOD_LABEL[r.period]}</td>
                    <td className="p-2.5">
                      <Value s={r.fund} render={(v) => docPct(v)} />
                    </td>
                    <td className="p-2.5">
                      <Value s={r.benchmark} render={(v) => docPct(v)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* sources */}
      <Card>
        <h2 className="m-0 text-[17px] font-bold">ที่มาของข้อมูล</h2>
        <ul className="m-0 mt-2 flex flex-col gap-1 pl-5 text-[14.5px] text-ink-body">
          {f.meta.isSample && <li>กองนี้เป็นข้อมูลตัวอย่าง สร้างขึ้นเพื่อสาธิตระบบ ไม่ใช่กองทุนจริง</li>}
          {f.meta.dataSource && <li>ที่มาของข้อมูล: {f.meta.dataSource}</li>}
          {f.meta.sourceFiles.map((s) => (
            <li key={s.file} className="break-all">
              {SOURCE_LABEL[s.source]}: {s.file}
            </li>
          ))}
          {f.meta.verifiedBy && <li>ตรวจข้อมูลโดย: {f.meta.verifiedBy}</li>}
          <li>เลขหน้าคือลำดับหน้าในไฟล์ PDF กดที่ป้ายเลขหน้าเพื่อดูข้อความในเอกสาร</li>
        </ul>
        <Disclaimer className="mt-3" />
      </Card>
    </AppShell>
  );
}
