export interface StockRow { productId: number; productName: string; unit: string; quantity: number; lowStockAlert: number; }
export interface MovementRow { id: number; productId: number; productName: string; type: string; quantity: number; costPrice: number; referenceId: number | null; note: string | null; createdAt: string; createdBy: string; }
