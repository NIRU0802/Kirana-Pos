import { z } from "zod";

export const restoredProductSchema = z.object({
  "Product ID": z.union([z.number(), z.string()]),
  "Name": z.string().min(1),
  "Unit": z.string().min(1),
  "Cost Price": z.union([z.number(), z.string()]),
  "Selling Price": z.union([z.number(), z.string()]),
  "MRP": z.union([z.number(), z.string()]),
  "GST Rate": z.union([z.number(), z.string()]),
});

export const restoredCustomerSchema = z.object({
  "Customer ID": z.union([z.number(), z.string()]),
  "Name": z.string().min(1),
  "Credit Limit": z.union([z.number(), z.string()]),
  "Credit Balance": z.union([z.number(), z.string()]),
});

export type RestoredProductRow = z.infer<typeof restoredProductSchema>;
export type RestoredCustomerRow = z.infer<typeof restoredCustomerSchema>;