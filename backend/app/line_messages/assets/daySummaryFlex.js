// สร้าง LINE Flex Message สรุปผลประจำวัน (ธีมน้ำเงิน)
// ใช้:
// const msg = buildDaySummary({
//   date: new Date(),          // หรือ '2569-10-16'
//   channel: 'หน้าเว็บ',
//   income: 12000,
//   expense: 7800,
//   orders: 8,
//   units: 23,
//   topProducts: [
//     { name: 'น้ำพริกตาแดง', qty: 5 },
//     { name: 'สบู่มะกรูด',   qty: 3 },
//     { name: 'กระเป๋าผ้าทอ', qty: 2 },
//   ],
// });

const BANNER = 'https://raw.githubusercontent.com/earth201215/line-photo/main/banner-summary-blue.jpg';

const NAVY = '#1B2559';
const GREY  = '#8A91A3';
const BLUE  = { main: '#2563EB', dark: '#1D4ED8', tint: '#E8F0FE', track: '#DCE7FD', light: '#93B4F6' };
const GREEN = { main: '#16A34A', tint: '#E7F8EE' };
const RED   = { main: '#E8335A', tint: '#FDECF0' };

// ---- helpers ----------------------------------------------------------------

const baht = (n) =>
  (n < 0 ? '-฿' : '฿') + Math.abs(Math.round(n)).toLocaleString('en-US');

/** แปลง Date หรือ string YYYY-MM-DD เป็น "16 ต.ค. 2569" (พ.ศ.) */
function formatThaiDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                  'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/** แปลง Date เป็น string สำหรับ postback data เช่น 2026-10-16 */
function isoDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  return d.toISOString().slice(0, 10);
}

function pill(text, c) {
  return {
    type: 'box', layout: 'vertical', flex: 0,
    backgroundColor: c.tint, cornerRadius: '12px',
    paddingTop: '3px', paddingBottom: '3px', paddingStart: '10px', paddingEnd: '10px',
    contents: [{ type: 'text', text, size: 'xs', weight: 'bold', color: c.dark || c.main }],
  };
}

function iconBox(glyph, color, size = '30px') {
  return {
    type: 'box', layout: 'vertical', flex: 0,
    width: size, height: size, cornerRadius: '9px',
    backgroundColor: color, justifyContent: 'center', alignItems: 'center',
    contents: [{ type: 'text', text: glyph, size: 'sm', weight: 'bold', color: '#FFFFFF', align: 'center' }],
  };
}

/** แถวรายรับ / รายจ่าย */
function moneyRow(label, amount, c, glyph) {
  return {
    type: 'box', layout: 'horizontal', alignItems: 'center', spacing: 'md',
    backgroundColor: c.tint + '99', cornerRadius: '14px',
    paddingAll: '10px', paddingStart: '12px', paddingEnd: '14px',
    contents: [
      iconBox(glyph, c.main),
      { type: 'text', text: label, size: 'sm', color: NAVY, flex: 1 },
      { type: 'text', text: baht(amount), size: 'md', weight: 'bold', color: c.main, flex: 0 },
    ],
  };
}

/** กล่องสถิติ 3 ช่อง: ออเดอร์ / ชิ้น / เฉลี่ยต่อออเดอร์ */
function statsRow(orders, units, avgPerOrder) {
  function statBox(emoji, value, label) {
    return {
      type: 'box', layout: 'vertical', flex: 1,
      backgroundColor: '#F8FAFF', cornerRadius: '14px',
      paddingAll: '12px', alignItems: 'center',
      contents: [
        { type: 'text', text: emoji, size: 'lg' },
        { type: 'text', text: String(value), size: 'xl', weight: 'bold', color: BLUE.main, margin: 'xs', adjustMode: 'shrink-to-fit' },
        { type: 'text', text: label, size: 'xxs', color: GREY },
      ],
    };
  }
  return {
    type: 'box', layout: 'horizontal', margin: 'lg', spacing: 'sm',
    contents: [
      statBox('🛒', orders, 'ออเดอร์'),
      statBox('📦', units, 'ชิ้น'),
      statBox('💰', baht(avgPerOrder), 'เฉลี่ย/ออเดอร์'),
    ],
  };
}

/** แถวสินค้าขายดี: แสดงเป็นจำนวน (qty) แล้วคำนวณ % เทียบกับ qty สูงสุด */
function productRow(rank, p, maxQty) {
  const pct = maxQty > 0 ? Math.round((p.qty / maxQty) * 100) : 0;
  const barWidth = Math.max(4, pct) + '%';
  const barColor = rank === 1 ? BLUE.main : BLUE.light;
  return {
    type: 'box', layout: 'vertical', spacing: 'sm',
    contents: [
      {
        type: 'box', layout: 'horizontal', alignItems: 'center', spacing: 'md',
        contents: [
          iconBox(String(rank), rank === 1 ? BLUE.main : BLUE.light, '24px'),
          { type: 'text', text: p.name, size: 'sm', color: NAVY, flex: 1, wrap: true, maxLines: 1 },
          { type: 'text', text: `${p.qty} ชิ้น`, size: 'sm', weight: 'bold', color: NAVY, flex: 0 },
        ],
      },
      {
        type: 'box', layout: 'vertical', height: '8px', cornerRadius: '4px', backgroundColor: BLUE.track,
        contents: [{
          type: 'box', layout: 'vertical', width: barWidth, height: '8px',
          cornerRadius: '4px', backgroundColor: barColor, contents: [],
        }],
      },
    ],
  };
}

// ---- main builder -----------------------------------------------------------

/**
 * @param {object} opts
 * @param {Date|string} opts.date        - วันที่ (Date object หรือ 'YYYY-MM-DD')
 * @param {string}      [opts.channel]   - ช่องทาง เช่น 'หน้าเว็บ', 'ไลน์'
 * @param {number}      opts.income      - รายรับ (บาท)
 * @param {number}      opts.expense     - รายจ่าย (บาท)
 * @param {number}      [opts.orders]    - จำนวนออเดอร์
 * @param {number}      [opts.units]     - จำนวนชิ้น
 * @param {{ name: string, qty: number }[]} [opts.topProducts] - สินค้าขายดี (สูงสุด 3)
 * @param {string}      [opts.reportId]  - id ใช้ใน postback data (default: isoDate)
 */
function buildDaySummary({ date = new Date(), channel, income, expense,
                           orders, units, topProducts = [], reportId }) {
  const dateObj  = date instanceof Date ? date : new Date(date);
  const dateStr  = reportId || isoDate(dateObj);
  const dateLabel = formatThaiDate(dateObj);

  const profit = income - expense;
  const margin = income > 0 ? Math.round((profit / income) * 100) : 0;
  const avgPerOrder = orders > 0 ? Math.round(income / orders) : 0;

  // header pills
  const topRow = {
    type: 'box', layout: 'horizontal', alignItems: 'center', spacing: 'sm',
    contents: [
      pill(dateLabel, BLUE),
      { type: 'filler' },
      ...(channel ? [pill(channel, { tint: '#F1F3F7', main: '#5B6478' })] : []),
    ],
  };

  const body = [
    topRow,
    { type: 'text', text: 'กำไรสุทธิวันนี้', size: 'sm', color: GREY, margin: 'lg' },
    {
      type: 'text', text: baht(profit), size: '3xl', weight: 'bold',
      adjustMode: 'shrink-to-fit', color: profit >= 0 ? BLUE.main : RED.main,
    },
    { type: 'text', text: `อัตรากำไร ${margin}% ของรายรับ`, size: 'xxs', color: GREY },
    {
      type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm',
      contents: [
        moneyRow('รายรับ',  income,  GREEN, '↑'),
        moneyRow('รายจ่าย', expense, RED,   '↓'),
      ],
    },
  ];

  // กล่องสถิติ — แสดงเฉพาะเมื่อมีข้อมูล orders หรือ units
  if (orders != null || units != null) {
    body.push(statsRow(orders ?? '-', units ?? '-', avgPerOrder));
  }

  // สินค้าขายดี
  if (topProducts.length) {
    const top3   = topProducts.slice(0, 3);
    const maxQty = Math.max(...top3.map((p) => p.qty));
    body.push(
      { type: 'text', text: 'สินค้าขายดีวันนี้', size: 'md', weight: 'bold', color: NAVY, margin: 'xl' },
      {
        type: 'box', layout: 'vertical', margin: 'md', spacing: 'lg',
        contents: top3.map((p, i) => productRow(i + 1, p, maxQty)),
      },
    );
  }

  const bubble = {
    type: 'bubble', size: 'mega',
    hero: { type: 'image', url: BANNER, size: 'full', aspectRatio: '1040:294', aspectMode: 'cover' },
    body: { type: 'box', layout: 'vertical', paddingAll: '20px', paddingBottom: '4px', contents: body },
    footer: {
      type: 'box', layout: 'vertical', spacing: 'xs', paddingAll: '16px', paddingTop: '16px',
      contents: [
        {
          type: 'button', style: 'primary', color: BLUE.main, height: 'md',
          action: { type: 'postback', label: 'ดูรายงานฉบับเต็ม', data: `action=day_report&id=${dateStr}`, displayText: 'ดูรายงานฉบับเต็ม' },
        },
        {
          type: 'button', style: 'link', color: GREY, height: 'sm',
          action: { type: 'postback', label: 'ดูสรุปรายเดือน', data: `action=month_summary&id=${dateStr}`, displayText: 'ดูสรุปรายเดือน' },
        },
      ],
    },
  };

  return { type: 'flex', altText: `สรุปวันที่ ${dateLabel}: กำไรสุทธิ ${baht(profit)}`, contents: bubble };
}

module.exports = { buildDaySummary, formatThaiDate };
