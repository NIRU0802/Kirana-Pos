export interface Product {
  id: number; barcode: string | null; name: string; description: string | null;
  categoryId: number | null; categoryName: string | null; unit: string;
  costPrice: number; sellingPrice: number; mrp: number; gstRate: number;
  hsnCode: string | null; isActive: boolean; lowStockAlert: number; stock: number;
  expiryDate: string | null; expiryAlertDays: number;
  createdAt: string; updatedAt: string;
}
export interface CreateProductInput {
  barcode?: string; name: string; description?: string; categoryId?: number; unit: string;
  costPrice: number; sellingPrice: number; mrp: number; gstRate: number; hsnCode?: string;
  lowStockAlert: number; openingStock: number;
  expiryDate?: string; expiryAlertDays?: number;
}
export interface UpdateProductInput {
  id: number; barcode?: string | null; name?: string; description?: string | null;
  categoryId?: number | null; unit?: string; costPrice?: number; sellingPrice?: number;
  mrp?: number; gstRate?: number; hsnCode?: string | null; isActive?: boolean; lowStockAlert?: number;
  expiryDate?: string | null; expiryAlertDays?: number;
}
export interface BulkImportResult {
  created: number; updated: number; failed: number;
  errors: { row: number; name?: string; message: string }[];
}