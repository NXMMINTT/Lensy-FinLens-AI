// U-Fox LINE Flex Message — Main Menu (v5 final)
// ✅ banner = U-Fox_Crypto_Sky_Mascot_Banner.png (รูปจริง มีข้อความครบ)
// ✅ hero เป็น image เดี่ยว (ไม่ต้องมี overlay แล้ว ข้อความอยู่ในรูปแล้ว)
// ✅ body สะอาด: speech bubble + 6 เมนู 3×2
// ✅ footer: ตั้งค่า / วิธีใช้ / คุยกับเรา

const BANNER = 'https://raw.githubusercontent.com/earth201215/line-photo/main/U-Fox_Crypto_Sky_Mascot_Banner.png';

const NAVY      = '#1B2559';
const GREY      = '#8A91A3';
const HEADER_BG = '#1A5FBB';
const FOOTER_BG = '#F4F7FF';
const BTN_BG    = '#E5E9F5';
const BTN_COLOR = '#4C566E';

const DEFAULT_MENUS = [
  { emoji: '💰', label: 'บันทึกรายรับ',  sub: 'เพิ่มรายรับเลย',      action: 'add_income',      bg: '#EBF4FF' },
  { emoji: '💸', label: 'บันทึกรายจ่าย', sub: 'จดได้ทันที',           action: 'add_expense',     bg: '#FFF0F3' },
  { emoji: '📊', label: 'สรุปภาพรวม',    sub: 'รายรับ-รายจ่าย',       action: 'summary',         bg: '#ECFAF3' },
  { emoji: '📦', label: 'จัดการสินค้า',  sub: 'เช็คสต็อก',            action: 'manage_products', bg: '#FFF8ED' },
  { emoji: '🌏', label: 'ดูตลาดคู่แข่ง', sub: 'เทรนด์โลก',           action: 'market_trends',   bg: '#EEF8FF' },
  { emoji: '👑', label: 'อัปเกรด',       sub: 'ฟีเจอร์พรีเมียม',     action: 'upgrade',         bg: '#FFFBEA' },
];

const DEFAULT_FOOTER_BTNS = [
  { emoji: '⚙️', label: 'ตั้งค่า',   action: 'settings'        },
  { emoji: '❓', label: 'วิธีใช้',   action: 'how_to_use'      },
  { emoji: '💬', label: 'คุยกับเรา', action: 'contact_support' },
];

function menuCard(item) {
  return {
    type: 'box', layout: 'vertical', flex: 1,
    backgroundColor: item.bg, cornerRadius: '14px', paddingAll: '13px',
    alignItems: 'center', spacing: 'xs',
    action: { type: 'postback', label: item.label, data: `action=${item.action}`, displayText: item.label },
    contents: [
      { type: 'text', text: item.emoji, size: 'xl',  align: 'center' },
      { type: 'text', text: item.label, size: 'sm',  weight: 'bold', color: NAVY, align: 'center' },
      { type: 'text', text: item.sub,   size: 'xxs', color: GREY,    align: 'center', wrap: true },
    ],
  };
}

function footerBtn(btn) {
  return {
    type: 'box', layout: 'horizontal', flex: 1,
    backgroundColor: BTN_BG, cornerRadius: '10px', paddingAll: '10px',
    alignItems: 'center', justifyContent: 'center', spacing: 'xs',
    action: { type: 'postback', label: btn.label, data: `action=${btn.action}`, displayText: btn.label },
    contents: [
      { type: 'text', text: btn.emoji, size: 'sm' },
      { type: 'text', text: btn.label, size: 'xs', weight: 'bold', color: BTN_COLOR },
    ],
  };
}

function buildUFoxMenu({
  banner     = BANNER,
  question   = '💬 วันนี้อยากให้ผมช่วยเรื่องอะไรดีครับ?',
  menus      = DEFAULT_MENUS,
  footerBtns = DEFAULT_FOOTER_BTNS,
} = {}) {
  const rows = [];
  const items = menus.slice(0, 6);
  for (let i = 0; i < items.length; i += 3) {
    rows.push({
      type: 'box', layout: 'horizontal', spacing: 'sm',
      contents: items.slice(i, i + 3).map(menuCard),
    });
  }

  return {
    type: 'flex',
    altText: 'U-Fox — เมนูหลัก',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: banner,
        size: 'full',
        aspectRatio: '1040:294',
        aspectMode: 'cover',
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '0px',
        contents: [{
          type: 'box', layout: 'vertical', paddingAll: '14px', paddingBottom: '8px',
          contents: [
            {
              type: 'box', layout: 'horizontal',
              backgroundColor: '#E8F1FF', cornerRadius: '12px', paddingAll: '12px',
              alignItems: 'center', spacing: 'sm',
              contents: [
                { type: 'text', text: '💬', size: 'md', flex: 0 },
                { type: 'text', text: question, size: 'sm', weight: 'bold', color: HEADER_BG, wrap: true, flex: 1 },
              ],
            },
            { type: 'box', layout: 'vertical', margin: 'md', spacing: 'sm', contents: rows },
          ],
        }],
      },
      footer: {
        type: 'box', layout: 'horizontal', spacing: 'sm',
        paddingAll: '10px', backgroundColor: FOOTER_BG,
        contents: footerBtns.slice(0, 3).map(footerBtn),
      },
    },
  };
}

module.exports = { buildUFoxMenu, DEFAULT_MENUS, DEFAULT_FOOTER_BTNS };
