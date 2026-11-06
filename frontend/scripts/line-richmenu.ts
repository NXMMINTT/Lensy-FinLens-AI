/**
 * npm run line:richmenu            -> builds assets/line-richmenu.png and prints the menu (no change on LINE)
 * npm run line:richmenu -- --apply -> creates the rich menu on the LINE OA and makes it the default
 *
 * 4 buttons: ค่าใช้จ่าย / ความเสี่ยง / คำนวณ / ถามน้อง Lensy. The buttons send the words the bot
 * understands (lib/line/bot.ts MENU); "คำนวณ" opens the compare page when a LIFF ID or site URL is set.
 */
import fs from "node:fs";
import path from "node:path";

import { LineBotClient, type messagingApi } from "@line/bot-sdk";
import sharp from "sharp";

import { MENU } from "../src/lib/line/bot";
import { appUrl } from "../src/lib/line/flex";

if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");

const W = 2500;
const H = 843;
const TILE = W / 4;
const OUT = path.join("assets", "line-richmenu.jpg");

const TILES = [
  { label: MENU.fees, sub: "ทุกชั้น บอกที่มา", pose: "lensy-coins.png" },
  { label: MENU.risks, sub: "ที่อาจถูกมองข้าม", pose: "lensy-checklist.png" },
  { label: MENU.calc, sub: "ค่าธรรมเนียมเป็นบาท", pose: "lensy-chart.png" },
  { label: MENU.ask, sub: "อธิบายง่าย ๆ", pose: "lensy-idea.png" },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

async function buildImage(): Promise<Buffer> {
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#FFFFFF"/>
    <rect y="0" width="${W}" height="10" fill="#1A7637"/>
    ${TILES.map((t, i) => {
      const x = i * TILE;
      return `
      <rect x="${x + 24}" y="44" width="${TILE - 48}" height="${H - 88}" rx="56" fill="#F3FAF5" stroke="#D5EBDD" stroke-width="4"/>
      <text x="${x + TILE / 2}" y="${H - 190}" text-anchor="middle" font-family="Leelawadee UI, Tahoma, sans-serif" font-size="${t.label.length > 8 ? 74 : 86}" font-weight="700" fill="#16301F">${esc(t.label)}</text>
      <text x="${x + TILE / 2}" y="${H - 112}" text-anchor="middle" font-family="Leelawadee UI, Tahoma, sans-serif" font-size="46" fill="#4F6A5A">${esc(t.sub)}</text>`;
    }).join("")}
  </svg>`;
  const mascots = await Promise.all(
    TILES.map(async (t, i) => ({
      input: await sharp(path.join("public", "mascot", t.pose)).resize(420, 420, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
      left: Math.round(i * TILE + (TILE - 420) / 2),
      top: 70,
    })),
  );
  // JPEG keeps the file well under the 1 MB limit for rich menu images
  return sharp(Buffer.from(bg)).composite(mascots).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}

function richMenu(): messagingApi.RichMenuRequest {
  const calcUrl = appUrl("/compare");
  return {
    size: { width: W, height: H },
    selected: true,
    name: "FinLens น้อง Lensy",
    chatBarText: "เมนูน้อง Lensy",
    areas: TILES.map((t, i) => ({
      bounds: { x: Math.round(i * TILE), y: 0, width: Math.round(TILE), height: H },
      action:
        t.label === MENU.calc && calcUrl
          ? { type: "uri", label: t.label, uri: calcUrl }
          : { type: "message", label: t.label, text: t.label },
    })),
  };
}

async function main() {
  const png = await buildImage();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, png);
  console.log(`สร้างรูปเมนูแล้ว: ${OUT} (${(png.length / 1024).toFixed(0)} KB)`);
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
  await client.setRichMenuImage(richMenuId, new Blob([new Uint8Array(png)], { type: "image/jpeg" }));
  await client.setDefaultRichMenu(richMenuId);
  console.log(`\nตั้งเมนูเป็นค่าเริ่มต้นแล้ว: ${richMenuId}`);
}

main().catch((e) => {
  console.error((e as { body?: string }).body ?? (e instanceof Error ? e.message : e));
  process.exit(1);
});
