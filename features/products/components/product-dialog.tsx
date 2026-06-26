"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProductSchema, updateProductSchema } from "../schemas";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { rupeesToPaise, paiseToRupees } from "@/shared/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import type { Product } from "../types";
import type { Category } from "@/features/categories/types";

interface Props { open: boolean; onClose: () => void; product: Product | null; onSaved: () => void; }

const GST_RATES = [0, 5, 12, 18, 28];
const UNITS = ["PCS", "KG", "GM", "LTR", "ML", "PKT", "BTL", "BOX", "DZN"];
type FormValues = z.infer<typeof createProductSchema>;

export function ProductDialog({ open, onClose, product, onSaved }: Props) {
  const { toast } = useToastEmitter();
  const [categories, setCategories] = useState<Category[]>([]);
  const isEdit = !!product;

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateProductSchema : createProductSchema),
  });

  useEffect(() => { ipcInvoke<Category[]>(IPC_CHANNELS.CATEGORY_GET_ALL).then(setCategories).catch(() => null); }, []);

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        name: product.name, barcode: product.barcode ?? undefined, description: product.description ?? undefined,
        categoryId: product.categoryId ?? undefined, unit: product.unit,
        costPrice: paiseToRupees(product.costPrice), sellingPrice: paiseToRupees(product.sellingPrice), mrp: paiseToRupees(product.mrp),
        gstRate: product.gstRate as 0 | 5 | 12 | 18 | 28, hsnCode: product.hsnCode ?? undefined,
        lowStockAlert: product.lowStockAlert, openingStock: 0,
      });
    } else {
      reset({ unit: "PCS", gstRate: 0, lowStockAlert: 10, openingStock: 0, costPrice: 0, sellingPrice: 0, mrp: 0 });
    }
  }, [open, product, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = { ...data, costPrice: rupeesToPaise(data.costPrice), sellingPrice: rupeesToPaise(data.sellingPrice), mrp: rupeesToPaise(data.mrp) };
      if (isEdit && product) {
        await ipcInvoke(IPC_CHANNELS.PRODUCT_UPDATE, { ...payload, id: product.id });
        toast({ title: "Product updated", variant: "success" });
      } else {
        await ipcInvoke(IPC_CHANNELS.PRODUCT_CREATE, payload);
        toast({ title: "Product created", variant: "success" });
      }
      onSaved(); onClose();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Product Name *</Label>
              <Input {...register("name")} placeholder="e.g. Tata Salt 1kg" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5"><Label>Barcode</Label><Input {...register("barcode")} placeholder="Scan or type barcode" /></div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller name="categoryId" control={control} render={({ field }) => (
                <Select value={field.value?.toString() ?? ""} onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Controller name="unit" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5"><Label>Cost Price (₹) *</Label><Input type="number" step="0.01" min="0" {...register("costPrice", { valueAsNumber: true })} /></div>
            <div className="space-y-1.5"><Label>Selling Price (₹) *</Label><Input type="number" step="0.01" min="0" {...register("sellingPrice", { valueAsNumber: true })} /></div>
            <div className="space-y-1.5"><Label>MRP (₹) *</Label><Input type="number" step="0.01" min="0" {...register("mrp", { valueAsNumber: true })} /></div>
            <div className="space-y-1.5">
              <Label>GST Rate *</Label>
              <Controller name="gstRate" control={control} render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GST_RATES.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5"><Label>Low Stock Alert</Label><Input type="number" min="0" {...register("lowStockAlert", { valueAsNumber: true })} /></div>
            {!isEdit && <div className="space-y-1.5"><Label>Opening Stock</Label><Input type="number" min="0" {...register("openingStock", { valueAsNumber: true })} /></div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : isEdit ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
