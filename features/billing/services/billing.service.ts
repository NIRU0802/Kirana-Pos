import { BillRepository } from "../repositories/bill.repository";
import { StockRepository } from "../../inventory/repositories/stock.repository";
import { CustomerRepository } from "../../customers/repositories/customer.repository";
import { withTransaction } from "../../../database/client";
import type { CreateBillInput, BillRow, BillItemRow } from "../types";

const billRepo = new BillRepository();
const stockRepo = new StockRepository();
const customerRepo = new CustomerRepository();

export const billingService = {
  createBill(input: CreateBillInput): number {
    return withTransaction(() => {
      for (const item of input.items) {
        const stock = stockRepo.getByProduct(item.productId);
        if (stock < item.quantity) throw new Error(`Insufficient stock for ${item.productName}. Available: ${stock}`);
      }
      const billId = billRepo.create(input);
      for (const item of input.items) {
        stockRepo.adjust(item.productId, "SALE", item.quantity, item.costPrice, billId, `Bill #${billId}`, input.createdBy ?? "system");
      }
      if (input.paymentMethod === "CREDIT" && input.customerId) {
        customerRepo.addCreditLedger(input.customerId, "DEBIT", input.grandTotal, billId, "Credit sale");
      }
      return billId;
    });
  },
  getBill(id: number): (BillRow & { items: BillItemRow[] }) | null { return billRepo.getById(id) ?? null; },
  getRecent(limit?: number): BillRow[] { return billRepo.getRecent(limit); },
  search(query: string): BillRow[] { return billRepo.search(query); },
  refund(billId: number, amount: number, reason: string, refundedBy: string): number {
    const bill = billRepo.getById(billId);
    if (!bill) throw new Error("Bill not found");
    if (bill.status === "REFUNDED") throw new Error("Bill already refunded");
    return withTransaction(() => {
      const refundId = billRepo.refund(billId, amount, reason, refundedBy);
      for (const item of bill.items) {
        stockRepo.adjust(item.productId, "REFUND", item.quantity, item.costPrice, billId, `Refund for bill #${billId}`, refundedBy);
      }
      if (bill.paymentMethod === "CREDIT" && bill.customerId) {
        customerRepo.addCreditLedger(bill.customerId, "CREDIT", amount, billId, `Refund: ${reason}`);
      }
      return refundId;
    });
  },
};
