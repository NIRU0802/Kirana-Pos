import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/features/billing/stores/cart.store";

const base = { productId: 1, productName: "Salt", barcode: null, unit: "PKT", quantity: 1, unitPrice: 2000, costPrice: 1800, gstRate: 0 };

beforeEach(() => useCartStore.getState().clearCart());

describe("CartStore", () => {
  it("adds item and computes line total", () => {
    useCartStore.getState().addItem(base);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]?.lineTotal).toBe(2000);
  });

  it("merges same product", () => {
    useCartStore.getState().addItem(base);
    useCartStore.getState().addItem(base);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it("calculates GST on line", () => {
    useCartStore.getState().addItem({ ...base, unitPrice: 10000, gstRate: 18 });
    const item = useCartStore.getState().items[0];
    expect(item?.gstAmount).toBe(1800);
    expect(item?.lineTotal).toBe(11800);
  });

  it("removes item", () => {
    useCartStore.getState().addItem(base);
    useCartStore.getState().removeItem(1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("applies discount in totals", () => {
    useCartStore.getState().addItem({ ...base, unitPrice: 10000 });
    useCartStore.getState().setDiscount(500);
    expect(useCartStore.getState().getTotals().grandTotal).toBe(9500);
  });
});
