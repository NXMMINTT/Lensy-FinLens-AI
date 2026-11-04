// สร้าง LINE Flex Message สรุปผลประจำปี (ธีมน้ำเงิน)
// ใช้:
// const msg = buildYearSummary({
//   year: 2569, channel: 'หน้าเว็บ', income: 1262000, expense: 748500,
//   topProducts: [{ name: 'น้ำพริกตาแดง', share: 62 }, { name: 'สบู่มะกรูด', share: 24 }, { name: 'กระเป๋าผ้าทอ', share: 14 }],
// });

const BANNER = 'https://raw.githubusercontent.com/earth201215/line-photo/main/banner-summary-blue.jpg';

const NAVY = '#1B2559';
const GREY = '#8A91A3';
const BLUE = { main: '#2563EB', dark: '#1D4ED8', tint: '#E8F0FE', track: '#DCE7FD' };
const GREEN = { main: '#16A34A', tint: '#E7F8EE' };
const RED = { main: '#E8335A', tint: '#FDECF0' };

const baht = (n) => (n < 0 ? '-฿' : '฿') + Math.abs(Math.round(n)).toLocaleString('en-US');

function pill(text, c) {
  return {
    type: 'box', layout: 'vertical', flex: 0, backgroundColor: c.tint, cornerRadius: '12px',
    paddingTop: '3px', paddingBottom: '3px', paddingStart: '10px', paddingEnd: '10px',
    contents: [{ type: 'text', text, size: 'xs', weight: 'bold', color: c.dark || c.main }],
  };
}

function iconBox(glyph, color, size = '30px') {
  return {
    type: 'box', layout: 'vertical', flex: 0, width: size, height: size, cornerRadius: '9px',
    backgroundColor: color, justifyContent: 'center', alignItems: 'center',
    contents: [{ type: 'text', text: glyph, size: 'sm', weight: 'bold', color: '#FFFFFF', align: 'center' }],
  };
}

// แถวรายรับ / รายจ่าย แบบแถบสีอ่อน
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

// แถวสินค้าขายดี: อันดับ + ชื่อ + % + แถบ
function productRow(rank, p) {
  const width = Math.max(2, Math.min(100, Math.round(p.share))) + '%';
  return {
    type: 'box', layout: 'vertical', spacing: 'sm',
    contents: [
      {
        type: 'box', layout: 'horizontal', alignItems: 'center', spacing: 'md',
        contents: [
          iconBox(String(rank), rank === 1 ? BLUE.main : '#93B4F6', '24px'),
          { type: 'text', text: p.name, size: 'sm', color: NAVY, flex: 1, wrap: true, maxLines: 1 },
          { type: 'text', text: `${Math.round(p.share)}%`, size: 'sm', weight: 'bold', color: NAVY, flex: 0 },
        ],
      },
      {
        type: 'box', layout: 'vertical', height: '8px', cornerRadius: '4px', backgroundColor: BLUE.track,
        contents: [{ type: 'box', layout: 'vertical', width, height: '8px', cornerRadius: '4px', backgroundColor: BLUE.main, contents: [] }],
      },
    ],
  };
}

function buildYearSummary({ year, channel, income, expense, topProducts = [], reportId = 'YEAR' }) {
  const profit = income - expense;
  const margin = income > 0 ? Math.round((profit / income) * 100) : 0;

  const topRow = {
    type: 'box', layout: 'horizontal', alignItems: 'center', spacing: 'sm',
    contents: [
      pill(`ปี ${year}`, BLUE),
      { type: 'filler' },
      ...(channel ? [pill(channel, { tint: '#F1F3F7', main: '#5B6478' })] : []),
    ],
  };

  const body = [
    topRow,
    { type: 'text', text: 'กำไรสุทธิ', size: 'sm', color: GREY, margin: 'lg' },
    {
      type: 'text', text: baht(profit), size: '3xl', weight: 'bold', adjustMode: 'shrink-to-fit',
      color: profit >= 0 ? BLUE.main : RED.main,
    },
    { type: 'text', text: `อัตรากำไร ${margin}% ของรายรับ`, size: 'xxs', color: GREY },
    {
      type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm',
      contents: [moneyRow('รายรับ', income, GREEN, '↑'), moneyRow('รายจ่าย', expense, RED, '↓')],
    },
  ];

  if (topProducts.length) {
    body.push(
      { type: 'text', text: 'สินค้าขายดี', size: 'md', weight: 'bold', color: NAVY, margin: 'xl' },
      {
        type: 'box', layout: 'vertical', margin: 'md', spacing: 'lg',
        contents: topProducts.slice(0, 3).map((p, i) => productRow(i + 1, p)),
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
          action: { type: 'postback', label: 'ดูรายงานฉบับเต็ม', data: `action=year_report&id=${reportId}`, displayText: 'ดูรายงานฉบับเต็ม' },
        },
        {
          type: 'button', style: 'link', color: GREY, height: 'sm',
          action: { type: 'postback', label: 'ดูสรุปรายเดือน', data: `action=month_summary&id=${reportId}`, displayText: 'ดูสรุปรายเดือน' },
        },
      ],
    },
  };

  return { type: 'flex', altText: `สรุปปี ${year}: กำไรสุทธิ ${baht(profit)}`, contents: bubble };
}

module.exports = { buildYearSummary };
