import { CustomerRepository } from "../repositories/customer.repository";
import type { Customer, LedgerEntry, CreateCustomerInput, UpdateCustomerInput } from "../types";

const repo = new CustomerRepository();

export const customerService = {
  getAll(): Customer[] { return repo.getAll().map((r) => ({ ...r, isActive: r.isActive === 1 })); },
  getById(id: number): Customer {
    const r = repo.getById(id);
    if (!r) throw new Error("Customer not found");
    return { ...r, isActive: r.isActive === 1 };
  },
  search(q: string): Customer[] { return repo.search(q).map((r) => ({ ...r, isActive: r.isActive === 1 })); },
  create(input: CreateCustomerInput, createdBy?: string): number { return repo.create(input, createdBy); },
  update(input: UpdateCustomerInput, createdBy?: string): boolean { return repo.update(input, createdBy); },
  getLedger(customerId: number): LedgerEntry[] { return repo.getLedger(customerId); },
  settle(input: { customerId: number; amount: number; note?: string }, _createdBy = "system"): void {
    const customer = repo.getById(input.customerId);
    if (!customer) throw new Error("Customer not found");
    if (input.amount > customer.creditBalance) throw new Error(`Amount exceeds outstanding balance of ₹${(customer.creditBalance/100).toFixed(2)}`);
    repo.addCreditLedger(input.customerId, "SETTLEMENT", input.amount, undefined, input.note ?? "Settlement");
  },
};
