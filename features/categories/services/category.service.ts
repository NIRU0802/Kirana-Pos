import { CategoryRepository } from "../repositories/category.repository";
import type { Category } from "../types";

const repo = new CategoryRepository();

export const categoryService = {
  getAll(): Category[] { return repo.getAll(); },
  create(name: string, createdBy?: string): number {
    const existing = repo.getAll().find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) throw new Error(`Category "${name}" already exists`);
    return repo.create(name, createdBy);
  },
  update(id: number, name: string, createdBy?: string): boolean { return repo.update(id, name, createdBy); },
  delete(id: number, createdBy?: string): boolean {
    const cat = repo.getById(id);
    if (cat && cat.productCount > 0) throw new Error(`Cannot delete: ${cat.productCount} products use this category`);
    return repo.delete(id, createdBy);
  },
};
