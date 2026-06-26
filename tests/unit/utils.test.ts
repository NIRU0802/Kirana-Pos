import { describe, it, expect } from "vitest";
import { formatCurrency, rupeesToPaise, paiseToRupees, generateBillNumber } from "@/shared/lib/utils";

describe("formatCurrency", () => {
  it("formats paise to rupees string", () => {
    expect(formatCurrency(10000)).toBe("₹100.00");
    expect(formatCurrency(0)).toBe("₹0.00");
    expect(formatCurrency(150)).toBe("₹1.50");
  });
});

describe("rupeesToPaise / paiseToRupees", () => {
  it("converts both directions", () => {
    expect(rupeesToPaise(100)).toBe(10000);
    expect(rupeesToPaise(1.5)).toBe(150);
    expect(paiseToRupees(10000)).toBe(100);
  });
});

describe("generateBillNumber", () => {
  it("pads counter with zeros", () => {
    expect(generateBillNumber("INV", 1)).toBe("INV-000001");
    expect(generateBillNumber("INV", 999)).toBe("INV-000999");
  });
});
