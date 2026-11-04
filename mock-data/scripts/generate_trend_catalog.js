// Generates mock-data/trend-catalog.json from the sample generator in NIGHT's
// Frontend/src/pages/trend.ts (same hash, same numbers), extended with the
// per-offer fields and price history that NIGHT's product.ts hard-coded for one item,
// and expanded from NIGHT's original 5 platforms to the full mock-data/platforms.json
// roster (60+) so the catalog actually shows off the "every platform" selling point.
// Usage (from repo root): node mock-data/scripts/generate_trend_catalog.js mock-data/trend-catalog.json
const fs = require("fs");
const path = require("path");

const TYPE_LABEL = {
  marketplace: "มาร์เก็ตเพลส",
  social_commerce: "โซเชียลคอมเมิร์ซ",
  classifieds: "ตลาดประกาศซื้อขาย",
  quick_commerce: "เดลิเวอรีด่วน",
  b2b_marketplace: "มาร์เก็ตเพลสค้าส่ง",
  own_store: "ร้านค้าของแบรนด์เอง",
};

const allPlatforms = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "platforms.json"), "utf8"),
);

// NIGHT's 3 "always in stock, deep per-offer detail" anchors, kept for continuity
// with the original design (Thaimart is our own B2B partner, not in platforms.json).
const PF = [
  { id: "thaimart", name: "Thaimart", intl: false, description: "ตลาดค้าส่ง-ปลีกสินค้าไทย พาร์ทเนอร์ B2B ของ U-Ledger AI" },
  ...allPlatforms.map((p) => ({
    id: p.platform_id,
    name: p.name,
    intl: p.region !== "Thailand",
    description: `${TYPE_LABEL[p.type] ?? p.type}${p.region ? ` · ${p.region}` : ""}`,
  })),
];

const CATS = [
  ["ความงามและของใช้ส่วนตัว", "M9 21h6V11H9zM10 11V6l4-3v8", [["ลิปทินท์เนื้อแมตต์", 199], ["เซรั่มวิตามินซี", 390], ["กันแดดเนื้อเจล", 290], ["คุชชั่นคุมมัน", 450]]],
  ["เสื้อผ้าแฟชั่นผู้ชาย", "M8 3l4 3 4-3 5 4-3 3v11H6V10L3 7z", [["เสื้อเชิ้ตลินินแขนยาว", 390], ["เสื้อโปโลผ้าคอตตอน", 290], ["กางเกงชิโน่ขาเต่อ", 490], ["เสื้อยืดโอเวอร์ไซซ์", 199]]],
  ["กระเป๋า", "M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2", [["กระเป๋าผ้าแคนวาส", 250], ["กระเป๋าสะพายข้างหนัง", 690], ["เป้ใส่โน้ตบุ๊ก", 790], ["กระเป๋าคาดอก", 350]]],
  ["รองเท้าผู้หญิง", "M3 17c4 0 7-2 9-6l2 1c1 3 4 5 7 5v3H3zM5 17v4", [["รองเท้าส้นสูงหัวแหลม", 590], ["รองเท้าแตะพื้นนุ่ม", 190], ["รองเท้าผ้าใบสีขาว", 690], ["รองเท้าคัทชูส้นเตี้ย", 450]]],
  ["นาฬิกาและแว่นตา", "M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0M9 8.5L10 3h4l1 5.5M9 15.5l1 5.5h4l1-5.5M12 10.5V12l1 1", [["นาฬิกาสมาร์ทวอทช์", 1290], ["แว่นกรองแสงสีฟ้า", 390], ["นาฬิกาสายสแตนเลส", 890], ["แว่นกันแดดทรงเหลี่ยม", 350]]],
  ["อุปกรณ์อิเล็กทรอนิกส์", "M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z", [["หูฟังไร้สายตัดเสียงรบกวน", 1590], ["ลำโพงบลูทูธพกพา", 790], ["พาวเวอร์แบงก์ 20000mAh", 590], ["สายชาร์จเร็ว USB-C", 129]]],
  ["เครื่องใช้ไฟฟ้าภายในบ้าน", "M3 5h18v12H3zM8 21h8M12 17v4", [["หม้อทอดไร้น้ำมัน", 1690], ["พัดลมไอเย็น", 2290], ["เครื่องดูดฝุ่นไร้สาย", 2490], ["กาต้มน้ำไฟฟ้า", 390]]],
  ["กล้องและอุปกรณ์ถ่ายภาพ", "M3 8h4l2-3h6l2 3h4v12H3zM8.5 13.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0", [["กล้องแอคชั่น 4K", 2990], ["ขาตั้งกล้องมือถือ", 290], ["ไฟริงไลท์ไลฟ์สด", 490], ["เมมโมรี่การ์ด 128GB", 390]]],
  ["ของเล่น สินค้าแม่และเด็ก", "M9 3h6M10 3v3H9L8 9v12h8V9l-1-3h-1V3M8 13h8", [["ตัวต่อบล็อกเสริมพัฒนาการ", 490], ["ขวดนมคอกว้าง", 290], ["ผ้าอ้อมแบบกางเกง", 359], ["รถเข็นเด็กพับได้", 2990]]],
  ["สัตว์เลี้ยง", "M12 13c-3 0-5 3-5 5 0 2 2 3 5 3s5-1 5-3c0-2-2-5-5-5M4.5 10a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M16.5 10a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M7.5 6a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M13.5 6a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0", [["อาหารแมวเม็ด 1.5 กก.", 390], ["ทรายแมวเต้าหู้", 159], ["ไม้ตกแมว", 99], ["ที่นอนสัตว์เลี้ยง", 450]]],
  ["กลุ่มผลิตภัณฑ์เพื่อสุขภาพ", "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6zM12 9v6M9 12h6", [["หน้ากากอนามัย 50 ชิ้น", 99], ["เจลแอลกอฮอล์ล้างมือ", 79], ["เครื่องวัดความดัน", 990], ["วิตามินรวม", 450]]],
  ["เสื้อผ้าแฟชั่นผู้หญิง", "M9 3h6l-1 5 5 13H5l5-13z", [["เดรสลายดอกแขนตุ๊กตา", 390], ["เสื้อครอปถักไหมพรม", 290], ["กางเกงยีนส์ขากว้าง", 590], ["ชุดเซ็ตผ้าซาติน", 490]]],
  ["รองเท้าผู้ชาย", "M3 17V9l5 1 3 3 7 1c2 0 3 1 3 3v1H3zM3 20h18", [["รองเท้าผ้าใบหุ้มข้อ", 890], ["รองเท้าแตะสวม", 250], ["รองเท้าหนังลำลอง", 1290], ["รองเท้าวิ่งน้ำหนักเบา", 1190]]],
  ["เครื่องประดับ", "M6 4h12l3 5-9 12L3 9zM3 9h18M9 4l3 5 3-5", [["สร้อยคอเงินแท้", 590], ["ต่างหูมุก", 290], ["แหวนสแตนเลสมินิมอล", 190], ["กำไลข้อมือลูกปัด", 150]]],
  ["เครื่องใช้ในบ้าน", "M3 19V7M3 13h18v6M21 19v-6M7 13v-3h5v3", [["ชุดผ้าปูที่นอน 6 ฟุต", 690], ["หมอนเมมโมรี่โฟม", 490], ["กล่องเก็บของพับได้", 199], ["ม่านทึบแสง", 390]]],
  ["มือถือ และแท็บเล็ต", "M7 2h10v20H7zM11 18h2", [["เคสมือถือกันกระแทก", 159], ["ฟิล์มกระจกนิรภัย", 99], ["แท็บเล็ต 10 นิ้ว", 5990], ["ที่วางมือถือในรถ", 199]]],
  ["คอมพิวเตอร์และแล็ปท็อป", "M5 5h14v10H5zM2 19h20", [["เมาส์ไร้สายเสียงเงียบ", 290], ["คีย์บอร์ดเมคานิคอล", 1290], ["ขาตั้งโน้ตบุ๊ก", 390], ["ฮับ USB-C 7 in 1", 690]]],
  ["อาหารและเครื่องดื่ม", "M4 11h16a8 8 0 0 1-16 0M12 3v4M9 4v3M15 4v3", [["ข้าวหอมมะลิ 5 กก.", 230], ["กาแฟดริปซอง", 199], ["กราโนล่าคลีน", 159], ["ชาเขียวมัทฉะผง", 390]]],
  ["กีฬาและกิจกรรมกลางแจ้ง", "M2 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M15 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M5.5 16.5l4-7h6l3 7M9 6h3", [["ดัมเบลปรับน้ำหนัก", 1290], ["เสื่อโยคะ 6 มม.", 390], ["ขวดน้ำเก็บความเย็น", 290], ["จักรยานพับได้", 4990]]],
  ["เกมและอุปกรณ์เสริม", "M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.5H9A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4M7 11v3M5.5 12.5h3M16 12h.01M18 13.5h.01", [["จอยคอนโทรลเลอร์ไร้สาย", 990], ["หูฟังเกมมิ่ง", 790], ["แผ่นรองเมาส์ขนาดใหญ่", 199], ["เก้าอี้เกมมิ่ง", 3490]]],
];

// NIGHT's hash (trend.ts `h`)
const h = (s) => { let x = 7; for (const ch of String(s)) x = (Math.imul(x, 31) + ch.charCodeAt(0)) >>> 0; return x; };
// NIGHT's search-interest series (trend.ts `series`), 8 weeks actual + 2 forecast
const series = (name, g, n) => Array.from({ length: n }, (_, i) => Math.round((30 + i * (g / (n - 1)) * 0.6 + (h(name + i) % 14)) * 10) / 10);
const round = (n) => (n >= 300 ? Math.round(n / 10) * 10 : Math.round(n));
const WEEKS = Array.from({ length: 8 }, (_, i) => `2026-W${35 + i}`);
// Platforms that are always in stock for every product (NIGHT's original "anchor" set).
const ALWAYS_AVAILABLE = new Set(["thaimart", "shopee_th", "lazada_th"]);
const sellerLabel = (p) => (p.intl ? "ร้านต่างประเทศ" : p.id === "thaimart" ? "ร้านทั่วไป" : p.id.endsWith("_th") ? "ร้านทางการ" : "ร้านพาร์ทเนอร์");

const categories = CATS.map((c, ci) => ({ category_id: `C${String(ci + 1).padStart(2, "0")}`, name: c[0], icon_path: c[1] }));
let n = 0;
const products = CATS.flatMap((c, ci) =>
  c[2].map(([name, base]) => {
    const growth = (h(name) % 190) - 10;
    const prices = PF.map((p) => {
      const k = h(name + p.id);
      const available = ALWAYS_AVAILABLE.has(p.id) || k % 5 !== 0;
      const shops = 3 + (k % 120);
      const price = available ? Math.round(base * (0.82 + (k % 40) / 100 + (p.intl ? 0.25 : 0))) : null;
      return { platform_id: p.id, available, price, shops };
    });
    // Per-offer detail (NIGHT's product.ts hard-coded these for one item)
    const offers = prices.filter((x) => x.available).map((x) => {
      const p = PF.find((q) => q.id === x.platform_id);
      const k = h(name + x.platform_id + "o");
      return {
        platform_id: x.platform_id,
        seller: sellerLabel(p),
        price: x.price,
        shipping: p.intl ? 250 + (k % 15) * 10 : k % 3 === 0 ? 40 : 0,
        discount: p.intl ? 0 : Math.min((k % 4) * Math.max(10, round(x.price * 0.05)), round(x.price * 0.15)),
        rating: Math.round((4.3 + (k % 7) / 10) * 10) / 10,
        sold: 40 + (k % 3200),
        delivery: p.intl ? `${7 + (k % 4)}–${12 + (k % 4)} วัน` : `${2 + (k % 2)}–${4 + (k % 2)} วัน`,
        match_pct: p.intl ? 90 + (k % 6) : 95 + (k % 5),
      };
    });
    // 8-week price history for domestic platforms: drifts down toward today's price
    const price_history = { weeks: WEEKS, series: {} };
    for (const x of prices.filter((q) => q.available && !PF.find((p) => p.id === q.platform_id).intl)) {
      price_history.series[x.platform_id] = WEEKS.map((_, i) => {
        if (i === WEEKS.length - 1) return x.price;
        const drift = (WEEKS.length - 1 - i) * ((h(name + x.platform_id + "d") % 3) + 1) / 250;
        const noise = ((h(name + x.platform_id + i) % 5) - 2) / 100;
        return round(x.price * (1 + drift + noise));
      });
    }
    n += 1;
    return {
      product_id: `T${String(n).padStart(3, "0")}`,
      category_id: categories[ci].category_id,
      name,
      base_price: base,
      search_growth_pct: growth,
      sold_per_month: 300 + (h(name + "s") % 12000),
      peak_in_days: 7 + (h(name + "p") % 8),
      search_index: series(name, growth, 10),
      prices,
      offers,
      price_history,
    };
  }),
);

const out = {
  note: "ข้อมูลจำลองหน้าเทรนด์ตลาด — สร้างจาก sample generator ของ branch NIGHT (Frontend/src/pages/trend.ts, product.ts) ด้วยสคริปต์เดียวกันจึงได้ตัวเลขเดิม ขยายจาก 5 แพลตฟอร์มเดิมเป็นชุดเต็มใน mock-data/platforms.json (60+); search_index 10 จุด = 8 สัปดาห์ที่ผ่านมา + คาดการณ์ 2 สัปดาห์",
  platforms: PF,
  categories,
  products,
};
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2) + "\n");
console.log(`platforms=${PF.length} categories=${categories.length} products=${products.length} bytes=${fs.statSync(process.argv[2]).size}`);
