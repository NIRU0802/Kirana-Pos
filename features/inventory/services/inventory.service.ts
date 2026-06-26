import { StockRepository } from "../repositories/stock.repository";
import type { StockMovementType } from "../../../shared/types";

const repo = new StockRepository();

export const inventoryService = {
  getAll() { return repo.getAll(); },
  getLowStock() { return repo.getLowStock(); },
  getByProduct(productId: number) { return repo.getByProduct(productId); },
  adjust(productId: number, type: StockMovementType, quantity: number, costPrice = 0, referenceId?: number, note?: string, createdBy = "system"): number {
    if (type === "SALE" || type === "ADJUSTMENT_OUT" || type === "DAMAGE") {
      const current = repo.getByProduct(productId);
      if (current < quantity) throw new Error(`Insufficient stock. Available: ${current}`);
    }
    return repo.adjust(productId, type, quantity, costPrice, referenceId, note, createdBy);
  },
  getMovements(productId: number, limit?: number) { return repo.getMovements(productId, limit); },
};
