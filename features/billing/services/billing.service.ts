import { BillRepository } from "../repositories/bill.repository";
import { StockRepository } from "../../inventory/repositories/stock.repository";
import { CustomerRepository } from "../../customers/repositories/customer.repository";
import { withTransaction } from "../../../database/client";
import type { CreateBillInput, BillRow, BillItemRow } from "../types";

const billRepo = new BillRepository();
const stockRepo = new StockRepository();
const customerRepo = new CustomerRepository();

export interface BillResult {
  billId: number;
  billNumber: string;
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  creditBalance: number | null;
}

export const billingService = {
  createBill(input: CreateBillInput): BillResult {
    // Step 1: stock check BEFORE opening transaction
    for (const item of input.items) {
      const stock = stockRepo.getByProduct(item.productId);
      if (stock < item.quantity)
        throw new Error(`Insufficient stock for ${item.productName}. Available: ${stock}`);
    }

    return withTransaction(() => {
      // Step 2: Create bill record
      const billId = billRepo.create(input);

      // Step 3: Deduct stock for every item sold
      for (const item of input.items) {
        stockRepo.adjust(
          item.productId, "SALE", item.quantity, item.costPrice,
          billId, `Bill #${billId}`, input.createdBy ?? "system"
        );
      }

      // Step 4: If khata/credit sale → add ledger entry
      if (input.paymentMethod === "CREDIT" && input.customerId) {
        customerRepo.addCreditLedger(
          input.customerId, "DEBIT", input.grandTotal, billId, "Credit sale"
        );
      }

      // Step 5: Fetch bill number
      const bill = billRepo.getById(billId);

      // Step 6: Fetch fresh customer data (balance updated by step 4)
      let customerPhone: string | null = null;
      let customerName: string | null = null;
      let creditBalance: number | null = null;

      if (input.customerId) {
        const customer = customerRepo.getById(input.customerId);
        if (customer) {
          customerPhone = customer.phone ?? null;
          customerName = customer.name;
          creditBalance = customer.creditBalance;
        }
      }

      return {
        billId,
        billNumber: bill?.billNumber ?? `#${billId}`,
        customerId: input.customerId ?? null,
        customerName,
        customerPhone,
        creditBalance,
      };
    });
  },

  getBill(id: number): (BillRow & { items: BillItemRow[] }) | null {
    return billRepo.getById(id) ?? null;
  },

  getRecent(limit?: number): BillRow[] { return billRepo.getRecent(limit); },

  search(query: string): BillRow[] { return billRepo.search(query); },

  refund(billId: number, amount: number, reason: string, refundedBy: string): number {
    const bill = billRepo.getById(billId);
    if (!bill) throw new Error("Bill not found");
    if (bill.status === "REFUNDED") throw new Error("Bill already refunded");
    return withTransaction(() => {
      const refundId = billRepo.refund(billId, amount, reason, refundedBy);
      for (const item of bill.items) {
        stockRepo.adjust(item.productId, "REFUND", item.quantity, item.costPrice,
          billId, `Refund for bill #${billId}`, refundedBy);
      }
      if (bill.paymentMethod === "CREDIT" && bill.customerId) {
        customerRepo.addCreditLedger(bill.customerId, "CREDIT", amount, billId, `Refund: ${reason}`);
      }
      return refundId;
    });
  },
};