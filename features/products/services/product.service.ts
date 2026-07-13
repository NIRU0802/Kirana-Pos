import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../../categories/repositories/category.repository";
import { importProductRowSchema, type ImportProductRow } from "../schemas";
import type { CreateProductInput, UpdateProductInput, Product, BulkImportResult } from "../types";

const repo = new ProductRepository();
const catRepo = new CategoryRepository();

export const productService = {
  getAll(): Product[] {
    return repo.getAll().map((r) => ({
      ...r,
      isActive: r.isActive === 1,
      expiryDate: r.expiryDate ?? null,
      expiryAlertDays: r.expiryAlertDays ?? 30,
    }));
  },
  getById(id: number): Product {
    const r = repo.getById(id);
    if (!r) throw new Error("Product not found");
    return { ...r, isActive: r.isActive === 1, expiryDate: r.expiryDate ?? null, expiryAlertDays: r.expiryAlertDays ?? 30 };
  },
  getByBarcode(barcode: string): Product | null {
    const r = repo.getByBarcode(barcode);
    return r ? { ...r, isActive: r.isActive === 1, expiryDate: r.expiryDate ?? null, expiryAlertDays: r.expiryAlertDays ?? 30 } : null;
  },
  search(q: string): Product[] {
    return repo.search(q).map((r) => ({
      ...r,
      isActive: r.isActive === 1,
      expiryDate: r.expiryDate ?? null,
      expiryAlertDays: r.expiryAlertDays ?? 30,
    }));
  },
  create(input: CreateProductInput, createdBy?: string): number { return repo.create(input, createdBy); },
  update(input: UpdateProductInput, createdBy?: string): boolean { return repo.update(input, createdBy); },
  delete(id: number, createdBy?: string): boolean { return repo.softDelete(id, createdBy); },

  bulkImport(rows: unknown[], createdBy = "system"): BulkImportResult {
    const result: BulkImportResult = { created: 0, updated: 0, failed: 0, errors: [] };
    const categoryCache = new Map<string, number>();

    for (let idx = 0; idx < rows.length; idx++) {
      const rowNum = idx + 2; // header is row 1 in Excel
      const raw = rows[idx];
      const parsed = importProductRowSchema.safeParse(raw);
      if (!parsed.success) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          name: (raw as Record<string, unknown>)?.["name"] as string | undefined,
          message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        });
        continue;
      }
      const data: ImportProductRow = parsed.data;
      try {
        let categoryId: number | undefined;
        if (data.category) {
          const key = data.category.trim().toLowerCase();
          if (categoryCache.has(key)) {
            categoryId = categoryCache.get(key);
          } else {
            const existing = catRepo.getAll().find((c) => c.name.toLowerCase() === key);
            categoryId = existing ? existing.id : catRepo.create(data.category.trim(), createdBy);
            categoryCache.set(key, categoryId);
          }
        }

        const existingProduct = data.barcode ? repo.getByBarcode(data.barcode) : repo.getByName(data.name);

        const payload = {
          barcode: data.barcode,
          name: data.name,
          categoryId,
          unit: data.unit,
          costPrice: Math.round(data.costPrice * 100),
          sellingPrice: Math.round(data.sellingPrice * 100),
          mrp: Math.round(data.mrp * 100),
          gstRate: data.gstRate,
          hsnCode: data.hsnCode,
          lowStockAlert: data.lowStockAlert,
          openingStock: data.openingStock,
          expiryDate: data.expiryDate || undefined,
          expiryAlertDays: data.expiryAlertDays,
        };

        if (existingProduct) {
          repo.update({ id: existingProduct.id, ...payload }, createdBy);
          result.updated++;
        } else {
          repo.create(payload, createdBy);
          result.created++;
        }
      } catch (e) {
        result.failed++;
        result.errors.push({ row: rowNum, name: data.name, message: e instanceof Error ? e.message : "Unknown error" });
      }
    }
    return result;
  },
};