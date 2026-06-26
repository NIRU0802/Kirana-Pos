import { z } from "zod";
const gst = z.union([z.literal(0), z.literal(5), z.literal(12), z.literal(18), z.literal(28)]);
export const createProductSchema = z.object({
  barcode: z.string().max(50).optional(),
  name: z.string().min(1, "Required").max(200),
  description: z.string().max(500).optional(),
  categoryId: z.number().int().positive().optional(),
  unit: z.string().min(1).max(20),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  mrp: z.number().min(0),
  gstRate: gst,
  hsnCode: z.string().max(20).optional(),
  lowStockAlert: z.number().int().min(0).default(10),
  openingStock: z.number().int().min(0).default(0),
});
export const updateProductSchema = createProductSchema.partial().extend({ id: z.number().int().positive() });
export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
