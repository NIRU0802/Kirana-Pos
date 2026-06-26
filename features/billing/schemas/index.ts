import { z } from "zod";
export const createBillSchema = z.object({
  customerId: z.number().int().positive().optional(),
  items: z.array(z.object({ productId:z.number().int().positive(), productName:z.string().min(1), quantity:z.number().int().positive(), unitPrice:z.number().int().min(0), costPrice:z.number().int().min(0), gstRate:z.number().int().min(0), gstAmount:z.number().int().min(0), lineTotal:z.number().int().min(0) })).min(1),
  subtotal:z.number().int().min(0), gstTotal:z.number().int().min(0),
  discount:z.number().int().min(0).default(0), roundOff:z.number().int().default(0),
  grandTotal:z.number().int().min(1), amountPaid:z.number().int().min(0),
  changeDue:z.number().int().min(0), paymentMethod:z.enum(["CASH","UPI","CREDIT","CARD"]),
  note:z.string().max(300).optional(),
});
export const refundSchema = z.object({ billId:z.number().int().positive(), amount:z.number().int().positive(), reason:z.string().min(1).max(300) });
export type CreateBillSchema = z.infer<typeof createBillSchema>;
