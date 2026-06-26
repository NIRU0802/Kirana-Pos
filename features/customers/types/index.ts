export interface Customer { id: number; name: string; phone: string | null; address: string | null; creditLimit: number; creditBalance: number; isActive: boolean; createdAt: string; updatedAt: string; }
export interface LedgerEntry { id: number; customerId: number; type: "CREDIT"|"DEBIT"|"SETTLEMENT"; amount: number; billId: number | null; note: string | null; createdAt: string; }
export interface CreateCustomerInput { name: string; phone?: string; address?: string; creditLimit?: number; }
export interface UpdateCustomerInput { id: number; name?: string; phone?: string | null; address?: string | null; creditLimit?: number; isActive?: boolean; }
