/**
 * LINE messages for น้อง Lensy (Flex Message cards + quick replies). Pure builders: no network.
 * Every card carries the "not investment advice" line (rule 5) and sample funds are labelled (rule 7).
 */
import type { messagingApi } from "@line/bot-sdk";

import type { AskResponse } from "../ask";
import { DISCLAIMER, MASTER_COST_NOTE, SAMPLE_DATA_LABEL } from "../disclaimer";
import { totalAnnualCostRate } from "../funds";
import { docPct, pct } from "../money";
import { riskAlerts, RISK_LEVEL_LABEL, type RiskLevel } from "../riskRules";
import type { DocSource, Fund, Sourced } from "../schema";
import { sourceRef } from "../sources";

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

function disclaimer(): FlexComponent {
  return text(DISCLAIMER, { size: "xxs", color: C.muted, margin: "md" });
}

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
  return [{ type: "button", style: primary ? "primary" : "secondary", color: primary ? C.brand : undefined, height: "sm", action: { type: "uri", label, uri } }];
}

function refsLine(items: Sourced<unknown>[]): string {
  return items
    .filter((s) => s.value !== null)
    .map(pageRef)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" + ");
}

/** Summary card for one fund: total yearly cost, hidden-fee warning, top risks, pages. */
export function fundCard(f: Fund): messagingApi.FlexMessage {
  const name = f.nameTh.value ?? f.code;
  const total = totalAnnualCostRate(f);
  const master = f.fees.masterFundExpense;
  const alerts = riskAlerts(f).slice(0, 3);

  const body: FlexComponent[] = [
    {
      type: "box",
      layout: "horizontal",
      spacing: "sm",
      contents: [text(f.code, { size: "xs", color: C.muted, weight: "bold", flex: 1, gravity: "center" }), ...(f.meta.isSample ? [sampleTag()] : [])],
    },
    text(name, { size: "lg", weight: "bold", color: C.ink }),
    {
      type: "box",
      layout: "vertical",
      backgroundColor: C.mint,
      cornerRadius: "lg",
      paddingAll: "12px",
      margin: "md",
      contents:
        total === null
          ? [text("ต้นทุนต่อปีรวม", { size: "xs", color: C.muted }), text("ไม่พบข้อมูลนี้ในเอกสาร", { color: C.body })]
          : [
              text("ต้นทุนต่อปีรวม", { size: "xs", color: C.muted }),
              text(pct(total), { size: "xxl", weight: "bold", color: C.brand }),
              // a Flex text may not be empty
              ...(refsLine([f.fees.ter, master]) ? [text(`ที่มา: ${refsLine([f.fees.ter, master])}`, { size: "xxs", color: C.muted })] : []),
            ],
    },
  ];

  if (master.value !== null && master.source !== "factsheet") {
    body.push({
      type: "box",
      layout: "vertical",
      backgroundColor: C.sunSoft,
      cornerRadius: "md",
      paddingAll: "8px",
      margin: "sm",
      contents: [text(`ค่าใช้จ่ายกองหลัก ${docPct(master.value)} (${pageRef(master)}) ${MASTER_COST_NOTE}`, { size: "xs", color: C.sunInk, weight: "bold" })],
    });
  }

  if (alerts.length) {
    body.push(text("ความเสี่ยงที่ควรรู้", { weight: "bold", color: C.ink, margin: "lg" }));
    for (const a of alerts) {
      const st = LEVEL_STYLE[a.level];
      body.push({
        type: "box",
        layout: "horizontal",
        spacing: "sm",
        margin: "sm",
        contents: [
          {
            type: "box",
            layout: "vertical",
            backgroundColor: st.bg,
            cornerRadius: "md",
            paddingAll: "3px",
            paddingStart: "6px",
            paddingEnd: "6px",
            flex: 0,
            contents: [text(RISK_LEVEL_LABEL[a.level], { size: "xxs", color: st.fg, weight: "bold", wrap: false })],
          },
          text(`${a.title} (${a.refs.map((r) => `หน้า ${r.page}`).filter((v, i, x) => x.indexOf(v) === i).join(", ")})`, { size: "xs", flex: 1 }),
        ],
      });
    }
  }
  body.push(disclaimer());

  const footer = [...uriButton("ดูละเอียด", `/funds/${encodeURIComponent(f.code)}`, true), ...uriButton("คำนวณเป็นบาท", `/calculator?funds=${encodeURIComponent(f.code)}`)];

  return {
    type: "flex",
    altText: `${name}: ต้นทุนต่อปีรวม ${total === null ? "ไม่พบข้อมูล" : pct(total)}`,
    contents: {
      type: "bubble",
      size: "mega",
      body: { type: "box", layout: "vertical", spacing: "xs", contents: body },
      ...(footer.length ? { footer: { type: "box", layout: "vertical", spacing: "sm", contents: footer } } : {}),
    },
  };
}

/** Answer from the ask service as a card, with page references and assumptions. */
export function answerCard(res: AskResponse, fundCodes: string[]): messagingApi.FlexMessage {
  const body: FlexComponent[] = [
    text("น้อง Lensy ตอบ", { size: "xs", color: C.brand, weight: "bold" }),
    text(res.answer, { size: "sm", color: C.ink, margin: "sm" }),
  ];
  if (res.refs.length) {
    body.push(text("อ้างอิงในเอกสาร", { size: "xs", color: C.muted, weight: "bold", margin: "lg" }));
    for (const r of res.refs.slice(0, 5)) {
      body.push(text(`${fundCodes.length > 1 ? `${r.code} ` : ""}${pageRef(r)}${r.quote ? `: “${r.quote.slice(0, 90)}${r.quote.length > 90 ? "…" : ""}”` : ""}`, { size: "xxs", color: C.muted }));
    }
  }
  if (res.note) body.push(text(res.note, { size: "xxs", color: C.muted, margin: "lg" }));
  if (res.assumptions?.length) {
    body.push(text("สมมติฐาน", { size: "xs", color: C.muted, weight: "bold", margin: "lg" }));
    for (const a of res.assumptions) body.push(text(a, { size: "xxs", color: C.muted }));
  }
  body.push(disclaimer());
  const footer = uriButton("ถามต่อบนหน้าแชต", `/chat${fundCodes[0] ? `?fund=${encodeURIComponent(fundCodes[0])}` : ""}`);
  return {
    type: "flex",
    altText: res.answer.slice(0, 380),
    contents: {
      type: "bubble",
      size: "mega",
      body: { type: "box", layout: "vertical", contents: body },
      ...(footer.length ? { footer: { type: "box", layout: "vertical", contents: footer } } : {}),
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
