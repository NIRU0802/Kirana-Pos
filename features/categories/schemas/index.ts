import { z } from "zod";
export const categorySchema = z.object({ name: z.string().min(1,"Required").max(100) });
export type CategorySchema = z.infer<typeof categorySchema>;
