/**
 * npm run line:richmenu            -> builds assets/line-richmenu.jpg and prints the menu (no change on LINE)
 * npm run line:richmenu -- --apply -> creates the rich menu on the LINE OA and makes it the default
 *
 * Layout (2500 × 1686, LINE's tall size):
 *   ┌──────────────┬──────────────────────┐
 *   │              │ เทียบกองทุน (banner)  │
 *   │  ค่าใช้จ่าย    ├──────────┬───────────┤
 *   │  (big tile)  │ ความเสี่ยง │  คำนวณ     │
 *   ├────────┬─────┴──┬───────┴─┬─────────┤
 *   │ ถามน้อง │ ดูทีละกอง│ คลังศัพท์ │ กลโกง    │
 *   └────────┴────────┴─────────┴─────────┘
 * Chat buttons send the words the bot understands (lib/line/bot.ts MENU). Web buttons open the page
 * in LINE (LIFF, or the site URL); without either they fall back to a chat word.
 */
import fs from "node:fs";
import path from "node:path";

import { LineBotClient, type messagingApi } from "@line/bot-sdk";
import sharp, { type OverlayOptions } from "sharp";

import { MENU } from "../src/lib/line/bot";
import { appUrl } from "../src/lib/line/flex";

if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");

const W = 2500;
const H = 1686;
const OUT = path.join("assets", "line-richmenu.jpg");
const FONT = "Leelawadee UI, Tahoma, sans-serif";

const C = {
  bg: "#E6F4EA",
  grid: "#D3EBDB",
  card: "#FFFFFF",
  line: "#C9E4D1",
  shadow: "#BFDCC8",
  brand: "#1A7637",
  dark: "#0F4D24",
  ink: "#16301F",
  body: "#4F6A5A",
  mint: "#DFF2E5",
  sun: "#FFC83D",
  band: "#F3FAF5",
};

type Box = { x: number; y: number; w: number; h: number };
type Action = { kind: "message"; text: string } | { kind: "web"; path: string; fallback: string; label: string };
type Area = Box & { action: Action };

// top: big tile, banner, two small tiles
const BIG: Box = { x: 40, y: 40, w: 1190, h: 1110 };
const BANNER: Box = { x: 1270, y: 40, w: 1190, h: 520 };
const RISK: Box = { x: 1270, y: 600, w: 575, h: 550 };
const CALC: Box = { x: 1885, y: 600, w: 575, h: 550 };
// bottom row: 4 equal buttons
const ROW_Y = 1215;
const ROW_H = 420;
const ROW_W = 580;
const ROW_GAP = (W - 80 - ROW_W * 4) / 3;
const row = (i: number): Box => ({ x: Math.round(40 + i * (ROW_W + ROW_GAP)), y: ROW_Y, w: ROW_W, h: ROW_H });

const BOTTOM = [
  { label: MENU.ask, pose: "lensy-headset.png", action: { kind: "message", text: MENU.ask } as Action },
  { label: "ดูทีละกอง", pose: "lensy-laptop.png", action: { kind: "web", path: "/explain", fallback: MENU.fees, label: "ดูทีละกอง" } as Action },
  { label: "คลังศัพท์", pose: "lensy-book.png", action: { kind: "web", path: "/glossary", fallback: MENU.ask, label: "คลังศัพท์" } as Action },
  { label: "กลโกงต้องระวัง", pose: "lensy-shocked.png", action: { kind: "web", path: "/red-flags", fallback: MENU.risks, label: "กลโกงต้องระวัง" } as Action },
];

const AREAS: Area[] = [
  { ...BIG, action: { kind: "message", text: MENU.fees } },
  { ...BANNER, action: { kind: "web", path: "/compare", fallback: MENU.calc, label: "เทียบกองทุน" } },
  { ...RISK, action: { kind: "message", text: MENU.risks } },
  { ...CALC, action: { kind: "web", path: "/calculator", fallback: MENU.calc, label: MENU.calc } },
  ...BOTTOM.map((b, i) => ({ ...row(i), action: b.action })),
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const t = (x: number, y: number, s: string, size: number, fill: string, o: { bold?: boolean; anchor?: "start" | "middle" } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "start"}" font-family="${FONT}" font-size="${size}" font-weight="${o.bold ? 700 : 400}" fill="${fill}">${esc(s)}</text>`;
/** a white card with a soft offset shadow, like a pressable tile */
const card = (b: Box, fill = C.card, rx = 56) =>
  `<rect x="${b.x}" y="${b.y + 14}" width="${b.w}" height="${b.h}" rx="${rx}" fill="${C.shadow}"/>
   <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${rx}" fill="${fill}" stroke="${C.line}" stroke-width="4"/>`;
const check = (x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r="34" fill="${C.mint}"/>
   <path d="M${x - 15} ${y + 1} l11 11 l20 -22" fill="none" stroke="${C.brand}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;

function background(): string {
  const grid: string[] = [];
  for (let x = 0; x <= W; x += 64) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${ROW_Y - 40}" stroke="${C.grid}" stroke-width="2"/>`);
  for (let y = 0; y <= ROW_Y - 40; y += 64) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.grid}" stroke-width="2"/>`);
  const big = [
    card(BIG),
    t(BIG.x + 80, BIG.y + 210, "ค่าใช้จ่าย", 150, C.brand, { bold: true }),
    t(BIG.x + 84, BIG.y + 305, "ทุกชั้นของกองทุน บอกที่มา", 60, C.ink),
    ...["รวมค่าใช้จ่ายกองหลัก", "ส่วนที่ Factsheet ไม่แสดง", "ทุกตัวเลขบอกเลขหน้า"].flatMap((s, i) => {
      const y = BIG.y + 470 + i * 120;
      return [check(BIG.x + 120, y - 20), t(BIG.x + 180, y, s, 58, C.ink)];
    }),
  ];
  const banner = [
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.brand}"/><stop offset="1" stop-color="${C.dark}"/></linearGradient></defs>`,
    `<rect x="${BANNER.x}" y="${BANNER.y + 14}" width="${BANNER.w}" height="${BANNER.h}" rx="56" fill="${C.shadow}"/>`,
    `<rect x="${BANNER.x}" y="${BANNER.y}" width="${BANNER.w}" height="${BANNER.h}" rx="56" fill="url(#g)"/>`,
    `<rect x="${BANNER.x + 60}" y="${BANNER.y + 56}" width="190" height="72" rx="36" fill="${C.sun}"/>`,
    t(BANNER.x + 155, BANNER.y + 106, "ใช้ฟรี", 42, C.ink, { bold: true, anchor: "middle" }),
    t(BANNER.x + 60, BANNER.y + 270, "เทียบกองทุน", 112, "#FFFFFF", { bold: true }),
    t(BANNER.x + 64, BANNER.y + 360, "เคียงกัน ต่างกันกี่บาท", 58, "#DFF7E6"),
    t(BANNER.x + 64, BANNER.y + 460, "เปิดหน้าเทียบ ›", 46, "#BDF08A", { bold: true }),
  ];
  const small = (b: Box, title: string, sub: string) => [
    card(b),
    t(b.x + b.w / 2, b.y + b.h - 110, title, 80, C.ink, { bold: true, anchor: "middle" }),
    t(b.x + b.w / 2, b.y + b.h - 45, sub, 42, C.body, { anchor: "middle" }),
  ];
  const bottom = [
    `<rect x="0" y="${ROW_Y - 40}" width="${W}" height="${H - ROW_Y + 40}" fill="${C.band}"/>`,
    `<rect x="0" y="${ROW_Y - 40}" width="${W}" height="6" fill="${C.line}"/>`,
    ...BOTTOM.flatMap((b, i) => {
      const r = row(i);
      return [card(r, C.card, 48), t(r.x + r.w / 2, r.y + r.h - 50, b.label, b.label.length > 10 ? 54 : 60, C.ink, { bold: true, anchor: "middle" })];
    }),
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    ${grid.join("")}
    ${big.join("")}
    ${banner.join("")}
    ${small(RISK, MENU.risks, "ที่อาจถูกมองข้าม").join("")}
    ${small(CALC, MENU.calc, "ค่าธรรมเนียมเป็นบาท").join("")}
    ${bottom.join("")}
  </svg>`;
}

async function pose(file: string, size: number, left: number, top: number): Promise<OverlayOptions> {
  const input = await sharp(path.join("public", "mascot", file)).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return { input, left: Math.round(left), top: Math.round(top) };
}

async function buildImage(): Promise<Buffer> {
  const layers = await Promise.all([
    pose("lensy-coins.png", 470, BIG.x + BIG.w - 500, BIG.y + BIG.h - 495),
    pose("lensy-magnifier.png", 430, BANNER.x + BANNER.w - 470, BANNER.y + 60),
    pose("lensy-checklist.png", 320, RISK.x + (RISK.w - 320) / 2, RISK.y + 30),
    pose("lensy-chart.png", 320, CALC.x + (CALC.w - 320) / 2, CALC.y + 30),
    ...BOTTOM.map((b, i) => {
      const r = row(i);
      return pose(b.pose, 250, r.x + (r.w - 250) / 2, r.y + 22);
    }),
  ]);
  // JPEG keeps the file well under the 1 MB limit for rich menu images
  return sharp(Buffer.from(background())).composite(layers).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}

function lineAction(a: Action): messagingApi.Action {
  if (a.kind === "message") return { type: "message", label: a.text, text: a.text };
  const uri = appUrl(a.path);
  return uri ? { type: "uri", label: a.label, uri } : { type: "message", label: a.fallback, text: a.fallback };
}

function richMenu(): messagingApi.RichMenuRequest {
  return {
    size: { width: W, height: H },
    selected: true,
    name: "FinLens น้อง Lensy (2 ชั้น)",
    chatBarText: "เมนูน้อง Lensy",
    areas: AREAS.map((a) => ({ bounds: { x: a.x, y: a.y, width: a.w, height: a.h }, action: lineAction(a.action) })),
  };
}

async function main() {
  const jpg = await buildImage();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, jpg);
  console.log(`สร้างรูปเมนูแล้ว: ${OUT} (${(jpg.length / 1024).toFixed(0)} KB)`);
  const menu = richMenu();
  console.log(JSON.stringify((menu.areas ?? []).map((a) => a.action), null, 2));

  if (!process.argv.includes("--apply")) {
    console.log("\nยังไม่ได้เปลี่ยนอะไรใน LINE ถ้าจะใช้จริง รัน: npm run line:richmenu -- --apply");
    return;
  }
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("ยังไม่มี LINE_CHANNEL_ACCESS_TOKEN ใน .env.local");
  const client = LineBotClient.fromChannelAccessToken({ channelAccessToken: token });
  const { richMenuId } = await client.createRichMenu(menu);
  await client.setRichMenuImage(richMenuId, new Blob([new Uint8Array(jpg)], { type: "image/jpeg" }));
  await client.setDefaultRichMenu(richMenuId);
  console.log(`\nตั้งเมนูเป็นค่าเริ่มต้นแล้ว: ${richMenuId}`);
}

main().catch((e) => {
  console.error((e as { body?: string }).body ?? (e instanceof Error ? e.message : e));
  process.exit(1);
});
