/**
 * Annual rates from the investment reference that a person can actually earn, so /calculator can turn
 * them into baht. Picked by hand from each topic's own facts (reference.test.ts checks the numbers
 * are there). Left out on purpose: the policy rate (not a deposit rate) and short promotions
 * (e.g. a 5% rate that ends in a few months), which would overstate a multi-year result.
 */
export type RateItem = {
  /** reference topic the figure comes from */
  topic: string;
  group: number;
  label: string;
  /** percent per year, as written in the topic */
  ratePct: number;
  /** true: interest is added each year (deposits, funds); false: paid out, not added (bond coupons) */
  compound: boolean;
  note: string;
};

export const RATE_ITEMS: RateItem[] = [
  {
    topic: "1.1",
    group: 1,
    label: "บัญชีเงินฝาก e-Saving",
    ratePct: 1.35,
    compound: true,
    note: "วงเงินไม่เกิน 1 ล้านบาท ส่วนเกินได้ 0.35% ข้อมูล มี.ค. 2569 ไม่ระบุธนาคาร ต้องเช็กกับธนาคารก่อน",
  },
  {
    topic: "1.6",
    group: 1,
    label: "กองทุนรวมตลาดเงิน (เฉลี่ยทั้งกลุ่ม 3 ปี)",
    ratePct: 1.52,
    compound: true,
    note: "ผลตอบแทนในอดีต ไม่ได้รับประกันว่าจะได้เท่านี้ในอนาคต",
  },
  {
    topic: "2.1",
    group: 2,
    label: "พันธบัตรรัฐบาล 5 ปี (Yield)",
    ratePct: 1.77,
    compound: false,
    note: "โดยประมาณถ้าซื้อที่ Yield นี้และถือจนครบ 5 ปี ราคาซื้อขายระหว่างทางขึ้นลงได้",
  },
  {
    topic: "2.3",
    group: 2,
    label: "พันธบัตรออมพลัส 3 ปี",
    ratePct: 1.8,
    compound: false,
    note: "ดอกเบี้ยจ่ายทุก 3 เดือน ซื้อได้เฉพาะช่วงที่เปิดขาย",
  },
  {
    topic: "2.3",
    group: 2,
    label: "พันธบัตรออมพลัส 10 ปี",
    ratePct: 2.8,
    compound: false,
    note: "ดอกเบี้ยจ่ายทุก 3 เดือน ซื้อได้เฉพาะช่วงที่เปิดขาย",
  },
];

/** Money earned on `principal` over `years` at `ratePct` per year, before tax. */
export function earned(principal: number, ratePct: number, years: number, compound: boolean): number {
  const r = ratePct / 100;
  return compound ? principal * ((1 + r) ** years - 1) : principal * r * years;
}
