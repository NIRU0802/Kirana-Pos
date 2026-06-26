import { z } from "zod";
export const adjustStockSchema = z.object({
  productId: z.number().int().positive(),
  type: z.enum(["PURCHASE","ADJUSTMENT_IN","ADJUSTMENT_OUT","DAMAGE","OPENING_STOCK"]),
  quantity: z.number().int().positive("Must be > 0"),
  costPrice: z.number().min(0).optional(),
  note: z.string().max(300).optional(),
});
export type AdjustStockSchema = z.infer<typeof adjustStockSchema>;
