export type StockMovementType = "PURCHASE" | "SALE" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" | "REFUND" | "DAMAGE" | "OPENING_STOCK";
export type PaymentMethod = "CASH" | "UPI" | "CREDIT" | "CARD";
export type BillStatus = "COMPLETED" | "REFUNDED" | "PARTIAL_REFUND";
export type UserRole = "admin" | "cashier" | "manager";
export type GstRate = 0 | 5 | 12 | 18 | 28;
export * from "./ipc";
