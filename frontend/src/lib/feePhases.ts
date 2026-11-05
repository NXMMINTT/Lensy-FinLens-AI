/** Fee X-Ray: when each fee is paid and how it is taken. Browser-safe (no data or fs imports). */
export type FeePhase = "buy" | "hold" | "sell" | "switch";

export const FEE_PHASES: { phase: FeePhase; title: string; how: string }[] = [
  { phase: "buy", title: "ตอนซื้อ", how: "จ่ายครั้งเดียว หักจากเงินที่โอนไปซื้อ" },
  { phase: "hold", title: "ระหว่างถือ", how: "หักจากเงินกองทุนทุกวัน สะท้อนอยู่ในราคาหน่วยลงทุน (NAV) ไม่เห็นเป็นบิล" },
  { phase: "sell", title: "ตอนขาย", how: "จ่ายครั้งเดียว หักจากเงินที่ได้รับเมื่อขายคืน" },
  { phase: "switch", title: "ตอนสับเปลี่ยนกอง", how: "จ่ายเมื่อย้ายเงินไปกองอื่นในบริษัทเดียวกัน" },
];
