import { z } from "zod";
export const createCustomerSchema = z.object({
  name: z.string().min(1,"Required").max(200),
  phone: z.string().regex(/^[6-9]\d{9}$/, "10-digit mobile").optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  creditLimit: z.number().min(0).default(0),
});
export const updateCustomerSchema = createCustomerSchema.partial().extend({ id: z.number().int().positive() });
export const settleSchema = z.object({ customerId: z.number().int().positive(), amount: z.number().positive("Must be > 0"), note: z.string().optional() });
export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;
export type SettleSchema = z.infer<typeof settleSchema>;
