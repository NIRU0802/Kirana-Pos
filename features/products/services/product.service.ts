import { ProductRepository } from "../repositories/product.repository";
import type { CreateProductInput, UpdateProductInput, Product } from "../types";

const repo = new ProductRepository();

export const productService = {
  getAll(): Product[] { return repo.getAll().map((r) => ({ ...r, isActive: r.isActive === 1 })); },
  getById(id: number): Product {
    const r = repo.getById(id);
    if (!r) throw new Error("Product not found");
    return { ...r, isActive: r.isActive === 1 };
  },
  getByBarcode(barcode: string): Product | null {
    const r = repo.getByBarcode(barcode);
    return r ? { ...r, isActive: r.isActive === 1 } : null;
  },
  search(q: string): Product[] { return repo.search(q).map((r) => ({ ...r, isActive: r.isActive === 1 })); },
  create(input: CreateProductInput, createdBy?: string): number { return repo.create(input, createdBy); },
  update(input: UpdateProductInput, createdBy?: string): boolean { return repo.update(input, createdBy); },
  delete(id: number, createdBy?: string): boolean { return repo.softDelete(id, createdBy); },
};
