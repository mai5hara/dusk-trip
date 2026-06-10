import { describe, it, expect } from "vitest";
import { formatDateRange } from "./format-date";

describe("formatDateRange", () => {
  it("formats a range within the same month", () => {
    expect(formatDateRange("2026-06-08", "2026-06-15")).toBe("8–15 Jun 2026");
  })
  it("fotmats arange across months", () => {
    expect(formatDateRange("2026-06-08", "2026-07-15")).toBe("8 Jun 2026 – 15 Jul 2026");
  })
  it("formats a range across years", () => {
    expect(formatDateRange("2026-06-08", "2027-07-15")).toBe("8 Jun 2026 – 15 Jul 2027");
  })
})