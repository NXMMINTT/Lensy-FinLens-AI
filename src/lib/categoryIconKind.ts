export type CategoryIconKind =
  | "bag" | "store" | "box" | "home" | "truck" | "bulb" | "megaphone" | "food" | "drink" | "fuel" | "other" | "tag";

/** Keyword → icon for income/expense categories, checked in order (first match wins). */
const CATEGORY_ICON: [string, CategoryIconKind][] = [
  ["ขายหน้าร้าน", "store"],
  ["ขาย", "bag"],
  ["ซื้อสินค้า", "box"],
  ["วัตถุดิบ", "box"],
  ["สินค้า", "box"],
  ["เช่า", "home"],
  ["ที่พัก", "home"],
  ["ขนส่ง", "truck"],
  ["ส่งของ", "truck"],
  ["สาธารณูปโภค", "bulb"],
  ["ไฟ", "bulb"],
  ["โฆษณา", "megaphone"],
  ["อาหาร", "food"],
  ["เครื่องดื่ม", "drink"],
  ["แก๊ส", "fuel"],
  ["น้ำมัน", "fuel"],
  ["อื่น", "other"],
];

export function categoryIconKind(name: string): CategoryIconKind {
  return CATEGORY_ICON.find(([kw]) => name.includes(kw))?.[1] ?? "tag";
}
