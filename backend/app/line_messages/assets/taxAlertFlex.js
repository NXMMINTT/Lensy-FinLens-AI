// สร้าง LINE Flex Message แจ้งเตือนภาษี (เพดาน VAT)
// ใช้: const msg = buildTaxAlert(1262000);  แล้วส่ง msg ผ่าน client.pushMessage / replyMessage

const VAT_CEILING = 1800000;

const NAVY = '#1B2559';
const GREY = '#8A91A3';

const ZONES = {
  green: {
    name: 'โซนเขียว',
    headline: 'ยอดขายยังห่างจากเพดาน VAT',
    main: '#16A34A', dark: '#11823B', tint: '#E7F8EE', track: '#D5F0DF', button: '#16A34A',
    banner: 'https://raw.githubusercontent.com/earth201215/line-photo/main/banner-tax-green.jpg',
    tips: [
      'จดรายรับทุกวัน ยอดจะได้ไม่ตกหล่น',
      'เก็บใบเสร็จค่าวัตถุดิบให้ครบ',
      'เช็กยอดสะสมทุกต้นเดือน',
    ],
  },
  yellow: {
    name: 'โซนเหลือง',
    headline: 'ยอดขายเริ่มใกล้เพดาน VAT แล้ว',
    main: '#F5B82E', dark: '#8A5A00', tint: '#FFF4D6', track: '#FBE9BC', button: '#D18E00',
    banner: 'https://raw.githubusercontent.com/earth201215/line-photo/707df11/banner-tax-yellow.jpg',
    tips: [
      'เก็บใบเสร็จค่าวัตถุดิบให้ครบ',
      'เช็กยอดขายทุกแพลตฟอร์มให้ตรง',
      'ถ้าเกินเพดาน จด VAT ภายใน 30 วัน',
    ],
  },
  red: {
    name: 'โซนแดง',
    headline: 'ยอดขายใกล้หรือเกินเพดาน VAT',
    main: '#E8335A', dark: '#C21F45', tint: '#FDECF0', track: '#F9D3DC', button: '#E8335A',
    banner: 'https://raw.githubusercontent.com/earth201215/line-photo/main/banner-tax-red.jpg',
    tips: [
      'เตรียมเอกสารสำหรับจด VAT ให้พร้อม',
      'ถ้าเกินเพดาน ต้องจด VAT ภายใน 30 วัน',
      'ปรึกษานักบัญชีเรื่องการออกใบกำกับภาษี',
    ],
  },
};

function zoneOf(percent) {
  if (percent < 60) return 'green';
  if (percent < 90) return 'yellow';
  return 'red'; // 90% ขึ้นไป รวมถึงเกิน 100%
}

const baht = (n) => '฿' + Math.round(n).toLocaleString('en-US');

function tipRow(text, z) {
  return {
    type: 'box', layout: 'horizontal', alignItems: 'center', spacing: 'md',
    backgroundColor: z.tint + '99', cornerRadius: '14px',
    paddingAll: '10px', paddingStart: '12px', paddingEnd: '12px',
    contents: [
      {
        type: 'box', layout: 'vertical', flex: 0, width: '28px', height: '28px', cornerRadius: '8px',
        backgroundColor: z.main, justifyContent: 'center', alignItems: 'center',
        contents: [{ type: 'text', text: '✓', size: 'sm', weight: 'bold', color: '#FFFFFF', align: 'center' }],
      },
      { type: 'text', text, size: 'sm', color: NAVY, wrap: true, flex: 1 },
    ],
  };
}

function buildTaxAlert(sales, { ceiling = VAT_CEILING, txId = 'TAX' } = {}) {
  const percent = Math.round((sales / ceiling) * 100);
  const key = zoneOf(percent);
  const z = ZONES[key];
  const over = sales > ceiling;
  const remainText = over ? `เกินมาแล้ว ${baht(sales - ceiling)}` : `เหลืออีก ${baht(ceiling - sales)}`;
  const barWidth = Math.max(2, Math.min(100, percent)) + '%';

  const bubble = {
    type: 'bubble', size: 'mega',
    header: {
      type: 'box', layout: 'vertical', backgroundColor: z.tint, paddingAll: '20px', paddingBottom: '16px', spacing: 'xs',
      contents: [
        { type: 'text', text: `แจ้งเตือนภาษี · ${z.name}`, size: 'lg', weight: 'bold', color: z.dark },
        { type: 'text', text: over ? 'ยอดขายเกินเพดาน VAT แล้ว' : z.headline, size: 'xs', color: z.dark, wrap: true },
      ],
    },
    body: {
      type: 'box', layout: 'vertical', paddingAll: '20px', paddingBottom: '4px',
      contents: [
        {
          type: 'box', layout: 'horizontal', alignItems: 'center',
          contents: [
            { type: 'text', text: 'ยอดขายสะสมปีนี้', size: 'sm', color: GREY, flex: 1 },
            {
              type: 'box', layout: 'vertical', flex: 0, backgroundColor: z.tint, cornerRadius: '12px',
              paddingTop: '3px', paddingBottom: '3px', paddingStart: '10px', paddingEnd: '10px',
              contents: [{ type: 'text', text: `${percent}%`, size: 'xs', weight: 'bold', color: z.dark }],
            },
          ],
        },
        { type: 'text', text: baht(sales), size: '3xl', weight: 'bold', color: NAVY, margin: 'sm', adjustMode: 'shrink-to-fit' },
        {
          type: 'box', layout: 'vertical', margin: 'md', height: '10px', cornerRadius: '5px', backgroundColor: z.track,
          contents: [{
            type: 'box', layout: 'vertical', width: barWidth, height: '10px', cornerRadius: '5px',
            backgroundColor: z.main, contents: [],
          }],
        },
        {
          type: 'box', layout: 'horizontal', margin: 'sm',
          contents: [
            { type: 'text', text: `${percent}% ของเพดาน ${baht(ceiling)}`, size: 'xxs', color: GREY, flex: 1 },
            { type: 'text', text: remainText, size: 'xxs', weight: 'bold', color: z.dark, flex: 0 },
          ],
        },
        { type: 'text', text: 'สิ่งที่ควรเตรียมไว้ค่ะ', size: 'md', weight: 'bold', color: NAVY, margin: 'xl' },
        { type: 'box', layout: 'vertical', margin: 'md', spacing: 'sm', contents: z.tips.map((t) => tipRow(t, z)) },
      ],
    },
    footer: {
      type: 'box', layout: 'vertical', spacing: 'xs', paddingAll: '16px', paddingTop: '12px',
      contents: [
        {
          type: 'button', style: 'primary', color: z.button, height: 'md',
          action: { type: 'postback', label: 'ดูรายละเอียดภาษี', data: `action=tax_detail&id=${txId}`, displayText: 'ดูรายละเอียดภาษี' },
        },
        {
          type: 'button', style: 'link', color: GREY, height: 'sm',
          action: { type: 'postback', label: 'เตือนอีกครั้งเดือนหน้า', data: `action=tax_snooze&id=${txId}`, displayText: 'เตือนอีกครั้งเดือนหน้า' },
        },
      ],
    },
  };

  // โซนที่มีแบนเนอร์: ใช้รูปแทนแถบหัวสีพื้น (ข้อความหัวเรื่องอยู่ในรูปแล้ว)
  if (z.banner) {
    delete bubble.header;
    bubble.hero = { type: 'image', url: z.banner, size: 'full', aspectRatio: '1040:294', aspectMode: 'cover' };
  }

  return { type: 'flex', altText: `แจ้งเตือนภาษี · ${z.name} (${percent}% ของเพดาน VAT)`, contents: bubble };
}

module.exports = { buildTaxAlert, zoneOf };
