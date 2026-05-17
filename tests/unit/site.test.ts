import { describe, expect, it } from "vitest";
import { toBengaliNumber, formatBdtBn } from "@/lib/site";

describe("toBengaliNumber", () => {
  it("converts ASCII digits to Bengali numerals", () => {
    expect(toBengaliNumber(0)).toBe("০");
    expect(toBengaliNumber(123)).toBe("১২৩");
    expect(toBengaliNumber("450")).toBe("৪৫০");
  });

  it("preserves non-digit characters", () => {
    expect(toBengaliNumber("৳450")).toBe("৳৪৫০");
    expect(toBengaliNumber("12-AB-34")).toBe("১২-AB-৩৪");
  });
});

describe("formatBdtBn", () => {
  it("formats a BDT amount with Bengali numerals + ৳", () => {
    expect(formatBdtBn(450)).toBe("৪৫০৳");
    expect(formatBdtBn(1234567)).toBe("১,২৩৪,৫৬৭৳");
  });
});
