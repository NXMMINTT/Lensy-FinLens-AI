import { describe, expect, it } from "vitest";

import { DISCLAIMER, NOT_FOUND, SAMPLE_DATA_LABEL } from "./disclaimer";

describe("Responsible AI wording", () => {
  it("matches the exact text in project brief", () => {
    expect(DISCLAIMER).toBe("ข้อมูลเพื่อความเข้าใจ ไม่ใช่คำแนะนำการลงทุน");
    expect(NOT_FOUND).toBe("ไม่พบข้อมูลนี้ในเอกสาร");
    expect(SAMPLE_DATA_LABEL).toBe("ข้อมูลตัวอย่าง");
  });
});
