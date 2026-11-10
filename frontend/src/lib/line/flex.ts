/**
 * LINE messages for น้อง Lensy (Flex Message cards + quick replies). Pure builders: no network.
 * Every card carries the "not investment advice" line (rule 5) and sample funds are labelled (rule 7).
 */
import type { messagingApi } from "@line/bot-sdk";

import type { AskResponse } from "../ask";
import { DISCLAIMER, MASTER_COST_NOTE, REBATE_LABEL, SAMPLE_DATA_LABEL, totalCostLabel } from "../disclaimer";
import { annualCostIsEstimate, totalAnnualCostRate } from "../funds";
import { baht, docPct, pct } from "../money";
import { riskAlerts, RISK_LEVEL_LABEL, type RiskLevel } from "../riskRules";
import type { DocSource, Fund } from "../schema";
import { sourceRef } from "../sources";
import { DEFAULT_ANNUAL_RETURN, feeGapBaht, trueCost } from "../trueCost";

type Message = messagingApi.Message;
type FlexComponent = messagingApi.FlexComponent;
type QuickReplyItem = messagingApi.QuickReplyItem;

const C = {
  brand: "#1A7637",
  ink: "#16301F",
  body: "#3C5446",
  muted: "#6B7F73",
  line: "#E2F0E7",
  mint: "#E4F3E9",
  sunSoft: "#FFF4D1",
  sunInk: "#7A5200",
  dangerSoft: "#FEF2F2",
  dangerInk: "#991B1B",
  skySoft: "#EEF7F4",
} as const;

const LEVEL_STYLE: Record<RiskLevel, { bg: string; fg: string }> = {
  high: { bg: C.dangerSoft, fg: C.dangerInk },
  medium: { bg: C.sunSoft, fg: C.sunInk },
  info: { bg: C.skySoft, fg: C.body },
};

/** Link into the web app: through LIFF when configured (opens inside LINE), else the site URL. */
export function appUrl(path: string): string | null {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
  if (liffId) return `https://liff.line.me/${liffId}${path}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return site ? `${site}${path}` : null;
}

const text = (t: string, o: Partial<messagingApi.FlexText> = {}): messagingApi.FlexText => ({ type: "text", text: t, wrap: true, size: "sm", color: C.body, ...o });
/** "หน้า 2 · Factsheet", or just the source when it gives no page (e.g. SEC data). */
const pageRef = (s: { page: number | null; source: DocSource }) => sourceRef(s.page, s.source);

function sampleTag(): FlexComponent {
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: C.sunSoft,
    cornerRadius: "md",
    paddingAll: "4px",
    paddingStart: "8px",
    paddingEnd: "8px",
    flex: 0,
    contents: [text(SAMPLE_DATA_LABEL, { size: "xxs", color: C.sunInk, weight: "bold", wrap: false })],
  };
}

function uriButton(label: string, path: string, primary = false): FlexComponent[] {
  const uri = appUrl(path);
  if (!uri) return [];
  return [{ type: "button", style: primary ? "primary" : "link", color: primary ? "#06C755" : C.brand, height: "sm", action: { type: "uri", label, uri } }];
}

/**
 * A public picture from the site (LINE needs an https URL): NEXT_PUBLIC_SITE_URL, or on Vercel the
 * production domain Vercel sets by itself. Null when neither is known (the card then has no picture).
 */
function siteAsset(path: string): string | null {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const site = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || (vercel ? `https://${vercel}` : "")).replace(/\/$/, "");
  return site.startsWith("https://") ? `${site}${path}` : null;
}

/** A small filled square, for a legend. */
const swatch = (color: string): FlexComponent => ({ type: "box", layout: "vertical", width: "12px", height: "12px", cornerRadius: "3px", backgroundColor: color, contents: [], flex: 0 });

/** A green tick in a rounded square, for a checklist line. */
const tick = (): FlexComponent => ({
  type: "box",
  layout: "vertical",
  width: "24px",
  height: "24px",
  cornerRadius: "6px",
  backgroundColor: C.brand,
  justifyContent: "center",
  alignItems: "center",
  flex: 0,
  contents: [text("✓", { size: "sm", color: "#FFFFFF", weight: "bold", align: "center", wrap: false })],
});

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
/** "2026-09-30" -> "30 ก.ย. 2569" */
const thaiDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[3])} ${TH_MONTHS[Number(m[2]) - 1]} ${Number(m[1]) + 543}` : iso;
};

/** The baht example on the card: the same formula and defaults as the calculator. */
const CARD_CALC = { principal: 100_000, years: 10, annualReturn: DEFAULT_ANNUAL_RETURN } as const;

/**
 * Summary card for one fund: a green header with Lensy, the total yearly cost in big type, a two-colour
 * bar of what it is made of (the Thai fund's TER and the master fund's expense, with their pages), the
 * baht it costs over 10 years, the top risks as a checklist, and a button to the fund page.
 */
export function fundCard(f: Fund): messagingApi.FlexMessage {
  const name = f.nameTh.value ?? f.code;
  const total = totalAnnualCostRate(f);
  const estimate = total !== null && annualCostIsEstimate(f);
  const ter = f.fees.ter;
  const master = f.fees.masterFundExpense;
  const addMaster = master.value !== null && f.fees.terIncludesMasterFund.value !== true;
  const alerts = riskAlerts(f).slice(0, 3);
  const mascot = siteAsset("/mascot/lensy-coins.png");

  // header: what this card is, the fund, its master fund and risk level, and Lensy
  const sub = [f.masterFundName.value ? `ลงทุนผ่านกองหลัก ${f.masterFundName.value.split(",")[0]}` : null, f.riskLevel.value !== null ? `ความเสี่ยงระดับ ${f.riskLevel.value}` : null]
    .filter(Boolean)
    .join(" · ");
  const header: messagingApi.FlexBox = {
    type: "box",
    layout: "horizontal",
    paddingAll: "16px",
    background: { type: "linearGradient", angle: "135deg", startColor: C.brand, endColor: "#0F4D24" },
    contents: [
      {
        type: "box",
        layout: "vertical",
        flex: 1,
        spacing: "xs",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "vertical",
                backgroundColor: "#FFC83D",
                cornerRadius: "xl",
                paddingAll: "3px",
                paddingStart: "10px",
                paddingEnd: "10px",
                flex: 0,
                contents: [text("ค่าใช้จ่ายทุกชั้น", { size: "xxs", color: C.ink, weight: "bold", wrap: false })],
              },
              ...(f.meta.isSample ? [sampleTag()] : []),
            ],
          },
          text(f.code, { size: "xxl", color: "#FFFFFF", weight: "bold", wrap: false, margin: "sm" }),
          text(name, { size: "sm", color: "#DFF7E6" }),
          ...(sub ? [text(sub, { size: "xxs", color: "#BDF08A" })] : []),
        ],
      },
      ...(mascot ? [{ type: "image" as const, url: mascot, size: "80px", aspectMode: "fit" as const, aspectRatio: "1:1", flex: 0, gravity: "bottom" as const }] : []),
    ],
  };

  const body: FlexComponent[] = [];
  if (f.asOfDate.value) body.push(text(`ข้อมูล ณ ${thaiDate(f.asOfDate.value)}`, { size: "xxs", color: C.muted }));

  if (total === null) {
    body.push(text(totalCostLabel(false), { size: "xs", color: C.muted, margin: "sm" }), text("ไม่พบข้อมูลนี้ในเอกสาร", { color: C.body }));
  } else {
    body.push(text(totalCostLabel(estimate), { size: "xs", color: C.muted, margin: "sm" }), {
      type: "box",
      layout: "baseline",
      spacing: "sm",
      contents: [text(pct(total), { size: "3xl", weight: "bold", color: C.brand, flex: 0, wrap: false }), text("ต่อปี", { size: "sm", color: C.muted })],
    });

    // the two layers as one bar, then a legend with each layer's page
    const layers: { label: string; value: number; ref: string; color: string; note?: string }[] = [];
    if (ter.value !== null) layers.push({ label: "TER ของกองไทย", value: ter.value, ref: pageRef(ter), color: C.brand });
    if (addMaster && master.value !== null) {
      layers.push({ label: "ค่าใช้จ่ายกองหลัก", value: master.value, ref: pageRef(master), color: "#FFC83D" });
    }
    if (layers.length) {
      body.push({
        type: "box",
        layout: "horizontal",
        height: "14px",
        cornerRadius: "7px",
        margin: "md",
        backgroundColor: C.line,
        contents: layers.map((l) => ({ type: "box" as const, layout: "vertical" as const, backgroundColor: l.color, flex: Math.max(1, Math.round(l.value * 100)), contents: [] })),
      });
      for (const l of layers) {
        body.push({
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          margin: "md",
          contents: [
            { type: "box", layout: "vertical", flex: 0, paddingTop: "4px", contents: [swatch(l.color)] },
            {
              type: "box",
              layout: "vertical",
              flex: 1,
              contents: [text(l.label, { size: "sm", color: C.ink, weight: "bold" }), text(l.note ? `${l.ref} · ${l.note}` : l.ref, { size: "xxs", color: l.note ? C.sunInk : C.muted })],
            },
            text(docPct(l.value), { size: "sm", color: C.ink, weight: "bold", flex: 0, wrap: false }),
          ],
        });
      }
    }
    // the hidden layer, said in full: the point of the card
    if (addMaster && master.value !== null && master.source !== "factsheet") body.push(text(MASTER_COST_NOTE, { size: "xxs", color: C.sunInk, weight: "bold", margin: "sm" }));
    if (f.fees.rebate.value !== null) body.push(text(`${REBATE_LABEL} -${docPct(f.fees.rebate.value)} (${pageRef(f.fees.rebate)}) หักออกจากต้นทุนรวมแล้ว`, { size: "xxs", color: C.body, margin: "sm" }));
    if (estimate) body.push(text("ประมาณ: เอกสารไม่ระบุว่า TER รวมค่าใช้จ่ายกองหลักแล้วหรือยัง และยังไม่ได้หักเงินคืนจากกองหลัก (ถ้ามี)", { size: "xxs", color: C.muted, margin: "sm" }));

    // what that means in baht (the calculator's formula, never the AI)
    const r = trueCost({
      ...CARD_CALC,
      frontEnd: f.fees.frontEnd.value === null ? 0 : f.fees.frontEnd.value / 100,
      backEnd: f.fees.backEnd.value === null ? 0 : f.fees.backEnd.value / 100,
      annualCost: total,
    });
    body.push({
      type: "box",
      layout: "vertical",
      backgroundColor: C.mint,
      cornerRadius: "lg",
      paddingAll: "10px",
      margin: "md",
      contents: [
        text(`ลงทุน ${CARD_CALC.principal.toLocaleString("th-TH")} บาท ${CARD_CALC.years} ปี เสียค่าธรรมเนียมรวมราว`, { size: "xs", color: C.body }),
        text(baht(r.feeCost), { size: "lg", color: C.brand, weight: "bold" }),
        text(`สมมติผลตอบแทน ${CARD_CALC.annualReturn * 100}% ต่อปี คิดด้วยสูตร ไม่ใช่ AI`, { size: "xxs", color: C.muted }),
      ],
    });
  }

  if (alerts.length) {
    body.push({ type: "separator", margin: "lg", color: C.line }, text("ความเสี่ยงที่ควรรู้", { weight: "bold", color: C.ink, margin: "lg" }));
    for (const a of alerts) {
      const pages = a.refs.map((x) => `หน้า ${x.page}`).filter((v, i, xs) => xs.indexOf(v) === i).join(", ");
      body.push({
        type: "box",
        layout: "horizontal",
        spacing: "md",
        margin: "sm",
        paddingAll: "8px",
        cornerRadius: "md",
        backgroundColor: "#F3FAF5",
        contents: [
          tick(),
          {
            type: "box",
            layout: "vertical",
            flex: 1,
            contents: [text(a.title, { size: "sm", color: C.ink, weight: "bold" }), text(`${RISK_LEVEL_LABEL[a.level]}${pages ? ` · ${pages}` : ""}`, { size: "xxs", color: LEVEL_STYLE[a.level].fg })],
          },
        ],
      });
    }
  }

  const detail = appUrl(`/funds/${encodeURIComponent(f.code)}`);
  const compare = appUrl(`/compare?funds=${encodeURIComponent(f.code)}`);
  const footer: FlexComponent[] = [
    ...(detail ? [{ type: "button" as const, style: "primary" as const, color: "#06C755", height: "sm" as const, action: { type: "uri" as const, label: "ดูละเอียด", uri: detail } }] : []),
    ...(compare ? [{ type: "button" as const, style: "link" as const, color: C.brand, height: "sm" as const, action: { type: "uri" as const, label: "เทียบกับกองอื่น", uri: compare } }] : []),
    text(DISCLAIMER, { size: "xxs", color: C.muted, align: "center" }),
  ];

  return {
    type: "flex",
    altText: `${name}: ${totalCostLabel(estimate)} ${total === null ? "ไม่พบข้อมูล" : pct(total)}`,
    contents: {
      type: "bubble",
      size: "mega",
      header,
      body: { type: "box", layout: "vertical", spacing: "xs", paddingAll: "16px", contents: body },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents: footer },
    },
  };
}

/** The colour of each fund in a comparison (same order as the web's chart). */
const FUND_COLORS = [C.brand, "#FFC83D", "#2E8BC0", "#B5651D"];

/** A coloured header with a badge, a title, a line under it and Lensy in a pose (shared by the cards). */
function cardHeader(o: { badge: string; title: string; sub?: string; pose: string; tone?: "green" | "sun" | "calm" }): messagingApi.FlexBox {
  const tone = o.tone ?? "green";
  const dark = tone === "green";
  const mascot = siteAsset(`/mascot/${o.pose}`);
  return {
    type: "box",
    layout: "horizontal",
    paddingAll: "16px",
    ...(dark
      ? { background: { type: "linearGradient" as const, angle: "135deg", startColor: C.brand, endColor: "#0F4D24" } }
      : { backgroundColor: tone === "sun" ? C.sunSoft : C.skySoft }),
    contents: [
      {
        type: "box",
        layout: "vertical",
        flex: 1,
        spacing: "xs",
        justifyContent: "center",
        contents: [
          {
            type: "box",
            layout: "vertical",
            backgroundColor: dark ? "#FFC83D" : "#FFFFFF",
            cornerRadius: "xl",
            paddingAll: "3px",
            paddingStart: "10px",
            paddingEnd: "10px",
            flex: 0,
            contents: [text(o.badge, { size: "xxs", color: C.ink, weight: "bold", wrap: false })],
          },
          text(o.title, { size: "lg", color: dark ? "#FFFFFF" : C.ink, weight: "bold", margin: "sm" }),
          ...(o.sub ? [text(o.sub, { size: "xxs", color: dark ? "#BDF08A" : C.muted })] : []),
        ],
      },
      ...(mascot ? [{ type: "image" as const, url: mascot, size: "72px", aspectMode: "fit" as const, aspectRatio: "1:1", flex: 0, gravity: "bottom" as const }] : []),
    ],
  };
}

/** One fund's yearly cost as a bar, against the most expensive fund in the comparison. */
function costBar(code: string, rate: number | null, max: number, color: string, estimate: boolean): FlexComponent {
  const share = rate === null || max <= 0 ? 0 : Math.max(1, Math.round((rate / max) * 100));
  return {
    type: "box",
    layout: "vertical",
    spacing: "xs",
    margin: "md",
    contents: [
      {
        type: "box",
        layout: "horizontal",
        contents: [
          text(code, { size: "sm", color: C.ink, weight: "bold", flex: 1, wrap: false }),
          text(rate === null ? "ไม่พบข้อมูล" : `${pct(rate)}${estimate ? " (ประมาณ)" : ""}`, { size: "sm", color: C.ink, weight: "bold", flex: 0, wrap: false }),
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        height: "12px",
        cornerRadius: "6px",
        backgroundColor: C.line,
        contents: share
          ? [
              { type: "box", layout: "vertical", backgroundColor: color, flex: share, contents: [] },
              ...(share < 100 ? [{ type: "box" as const, layout: "vertical" as const, flex: 100 - share, contents: [] }] : []),
            ]
          : [{ type: "filler" }],
      },
    ],
  };
}

/**
 * "เทียบ A กับ B": one card with every fund's yearly cost as bars and what that means in baht over
 * 10 years (the calculator's formula), then each fund's own card side by side (a carousel).
 */
export function compareMessages(funds: Fund[]): messagingApi.FlexMessage[] {
  const rows = funds.map((f, i) => {
    const total = totalAnnualCostRate(f);
    const fee =
      total === null
        ? null
        : trueCost({
            ...CARD_CALC,
            frontEnd: f.fees.frontEnd.value === null ? 0 : f.fees.frontEnd.value / 100,
            backEnd: f.fees.backEnd.value === null ? 0 : f.fees.backEnd.value / 100,
            annualCost: total,
          }).feeCost;
    return { f, total, fee, estimate: total !== null && annualCostIsEstimate(f), color: FUND_COLORS[i % FUND_COLORS.length] };
  });
  const max = Math.max(0, ...rows.map((r) => r.total ?? 0));
  const known = rows.filter((r) => r.fee !== null);
  const gap = feeGapBaht(known.map((r) => r.fee!));
  const codes = funds.map((f) => f.code).join(",");
  const detail = appUrl(`/compare?funds=${encodeURIComponent(codes)}`);

  const body: FlexComponent[] = [text(totalCostLabel(rows.some((r) => r.estimate)), { size: "xs", color: C.muted }), ...rows.map((r) => costBar(r.f.code, r.total, max, r.color, r.estimate))];
  if (known.length) {
    body.push({
      type: "box",
      layout: "vertical",
      backgroundColor: C.mint,
      cornerRadius: "lg",
      paddingAll: "10px",
      margin: "lg",
      spacing: "xs",
      contents: [
        text(`ลงทุน ${CARD_CALC.principal.toLocaleString("th-TH")} บาท ${CARD_CALC.years} ปี เสียค่าธรรมเนียมรวมราว`, { size: "xs", color: C.body }),
        ...known.map((r) => ({
          type: "box" as const,
          layout: "horizontal" as const,
          contents: [text(r.f.code, { size: "sm", color: C.ink, flex: 1, wrap: false }), text(baht(r.fee!), { size: "sm", color: C.ink, weight: "bold", flex: 0, wrap: false })],
        })),
        ...(gap !== null && gap > 0 ? [text(`ต่างกันราว ${baht(gap)}`, { size: "lg", color: C.brand, weight: "bold", margin: "sm" })] : []),
        text(`สมมติผลตอบแทน ${CARD_CALC.annualReturn * 100}% ต่อปีเท่ากันทุกกอง คิดด้วยสูตร ไม่ใช่ AI`, { size: "xxs", color: C.muted }),
      ],
    });
  }
  if (rows.some((r) => r.estimate)) body.push(text("ประมาณ: เอกสารไม่ระบุว่า TER รวมค่าใช้จ่ายกองหลักแล้วหรือยัง และยังไม่ได้หักเงินคืนจากกองหลัก (ถ้ามี)", { size: "xxs", color: C.muted, margin: "sm" }));
  body.push(text("เทียบเฉพาะค่าธรรมเนียม ไม่ได้บอกว่ากองไหนดีกว่า ดูความเสี่ยงของแต่ละกองในการ์ดถัดไปค่ะ", { size: "xxs", color: C.body, margin: "sm" }));

  const summary: messagingApi.FlexMessage = {
    type: "flex",
    altText: `เทียบ ${funds.map((f) => f.code).join(" กับ ")}${gap !== null ? `: ค่าธรรมเนียม 10 ปีต่างกันราว ${baht(gap)}` : ""}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: cardHeader({ badge: "เทียบค่าใช้จ่าย", title: `เทียบ ${funds.length} กอง`, sub: funds.map((f) => f.code).join(" · "), pose: "lensy-magnifier.png" }),
      body: { type: "box", layout: "vertical", paddingAll: "16px", contents: body },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          ...(detail ? [{ type: "button" as const, style: "primary" as const, color: "#06C755", height: "sm" as const, action: { type: "uri" as const, label: "เทียบละเอียดบนเว็บ", uri: detail } }] : []),
          text(DISCLAIMER, { size: "xxs", color: C.muted, align: "center" }),
        ],
      },
    },
  };
  const cards = funds.map(fundCard);
  const carousel: messagingApi.FlexMessage = {
    type: "flex",
    altText: cards.map((c) => c.altText).join(" | ").slice(0, 380),
    contents: { type: "carousel", contents: cards.map((c) => c.contents as messagingApi.FlexBubble) },
  };
  return [summary, carousel];
}

/** How each kind of answer looks: its badge, title, Lensy's pose and the header colour. */
const ANSWER_LOOK: Record<AskResponse["kind"], { badge: string; title: string; pose: string; tone: "green" | "sun" | "calm" }> = {
  ai: { badge: "น้อง Lensy ตอบ", title: "อธิบายให้ฟังค่ะ", pose: "lensy-idea.png", tone: "green" },
  money: { badge: "คำนวณเป็นบาท", title: "ค่าธรรมเนียมเป็นเงิน", pose: "lensy-coins.png", tone: "green" },
  refusal: { badge: "ข้อมูล ไม่ชี้นำ", title: "น้องแนะนำซื้อขายไม่ได้ค่ะ", pose: "lensy-think.png", tone: "sun" },
  not_configured: { badge: "ขอโทษค่ะ", title: "ตอนนี้ยังตอบไม่ได้", pose: "lensy-headset.png", tone: "calm" },
  busy: { badge: "ขอโทษค่ะ", title: "รอสักครู่นะคะ", pose: "lensy-headset.png", tone: "calm" },
  error: { badge: "ขอโทษค่ะ", title: "ตอบไม่สำเร็จ", pose: "lensy-headset.png", tone: "calm" },
};

/** Answer from the ask service as a card: a header by kind, the answer, page references as a checklist, then the assumptions. */
export function answerCard(res: AskResponse, fundCodes: string[], topicIds: string[] = []): messagingApi.FlexMessage {
  const look = ANSWER_LOOK[res.kind];
  const body: FlexComponent[] = [text(res.answer, { size: "sm", color: C.ink })];
  if (res.refs.length) {
    body.push({ type: "separator", margin: "lg", color: C.line }, text("อ้างอิงในเอกสาร", { size: "xs", color: C.ink, weight: "bold", margin: "lg" }));
    for (const r of res.refs.slice(0, 5)) {
      body.push({
        type: "box",
        layout: "horizontal",
        spacing: "md",
        margin: "sm",
        contents: [
          tick(),
          {
            type: "box",
            layout: "vertical",
            flex: 1,
            contents: [
              text(`${fundCodes.length > 1 ? `${r.code} · ` : ""}${pageRef(r)}`, { size: "xs", color: C.ink, weight: "bold" }),
              ...(r.quote ? [text(`“${r.quote.slice(0, 90)}${r.quote.length > 90 ? "…" : ""}”`, { size: "xxs", color: C.muted })] : []),
            ],
          },
        ],
      });
    }
  }
  if (res.note) body.push(text(res.note, { size: "xxs", color: C.muted, margin: "lg" }));
  if (res.assumptions?.length) {
    body.push({
      type: "box",
      layout: "vertical",
      backgroundColor: C.mint,
      cornerRadius: "lg",
      paddingAll: "10px",
      margin: "lg",
      spacing: "xs",
      contents: [text("สมมติฐาน", { size: "xs", color: C.ink, weight: "bold" }), ...res.assumptions.map((a) => text(`• ${a}`, { size: "xxs", color: C.body }))],
    });
  }
  // a single topic: its page (figures, risks, sources) first, then the chat
  const buttons = [
    ...(topicIds.length === 1 ? uriButton("ดูข้อมูลและแหล่งที่มา", `/reference/${topicIds[0].replace(".", "-")}`, true) : []),
    ...uriButton("ถามต่อบนหน้าแชต", `/chat${fundCodes[0] ? `?fund=${encodeURIComponent(fundCodes[0])}` : ""}`, topicIds.length !== 1),
  ];
  return {
    type: "flex",
    altText: res.answer.slice(0, 380),
    contents: {
      type: "bubble",
      size: "mega",
      header: cardHeader({ badge: look.badge, title: look.title, sub: fundCodes.length ? fundCodes.join(" · ") : undefined, pose: look.pose, tone: look.tone }),
      body: { type: "box", layout: "vertical", paddingAll: "16px", contents: body },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents: [...buttons, text(DISCLAIMER, { size: "xxs", color: C.muted, align: "center" })] },
    },
  };
}

/** Quick-reply chips (max 13, labels max 20 characters). */
export function quickReplies(items: { label: string; text: string }[]): messagingApi.QuickReply {
  return {
    items: items.slice(0, 13).map(
      (i): QuickReplyItem => ({ type: "action", action: { type: "message", label: i.label.length > 20 ? `${i.label.slice(0, 19)}…` : i.label, text: i.text.slice(0, 300) } }),
    ),
  };
}

export function textMessage(t: string, quickReply?: messagingApi.QuickReply): Message {
  return { type: "text", text: t.slice(0, 5000), ...(quickReply ? { quickReply } : {}) };
}
