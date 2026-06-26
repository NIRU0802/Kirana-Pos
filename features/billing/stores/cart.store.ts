import { create } from "zustand";
import type { CartItem, BillTotals } from "../types";
import type { PaymentMethod } from "../../../shared/types";

function calcItem(i: Omit<CartItem,"gstAmount"|"lineTotal">): CartItem {
  const base = i.unitPrice * i.quantity;
  const gstAmount = Math.round(base * i.gstRate / 100);
  return { ...i, gstAmount, lineTotal: base + gstAmount };
}

interface CartState {
  items: CartItem[]; discount: number; customerId: number | null; customerName: string | null; paymentMethod: PaymentMethod;
  addItem: (i: Omit<CartItem,"gstAmount"|"lineTotal">) => void;
  updateQty: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
  setDiscount: (p: number) => void;
  setCustomer: (id: number | null, name: string | null) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  clearCart: () => void;
  getTotals: () => BillTotals;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [], discount: 0, customerId: null, customerName: null, paymentMethod: "CASH",
  addItem: (newItem) => set((s) => {
    const idx = s.items.findIndex((i) => i.productId === newItem.productId);
    if (idx >= 0) return { items: s.items.map((i,n) => n === idx ? calcItem({...i, quantity: i.quantity + newItem.quantity}) : i) };
    return { items: [...s.items, calcItem(newItem)] };
  }),
  updateQty: (productId, qty) => {
    if (qty <= 0) { get().removeItem(productId); return; }
    set((s) => ({ items: s.items.map((i) => i.productId === productId ? calcItem({...i, quantity: qty}) : i) }));
  },
  removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  setDiscount: (discount) => set({ discount }),
  setCustomer: (customerId, customerName) => set({ customerId, customerName }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  clearCart: () => set({ items: [], discount: 0, customerId: null, customerName: null, paymentMethod: "CASH" }),
  getTotals: (): BillTotals => {
    const { items, discount } = get();
    const subtotal = items.reduce((s,i) => s + i.unitPrice * i.quantity, 0);
    const gstTotal = items.reduce((s,i) => s + i.gstAmount, 0);
    const afterDisc = subtotal + gstTotal - discount;
    const roundOff = Math.round(afterDisc / 100) * 100 - afterDisc;
    return { subtotal, gstTotal, discount, roundOff, grandTotal: afterDisc + roundOff };
  },
}));
