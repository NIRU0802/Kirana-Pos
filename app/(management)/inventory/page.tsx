"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { adjustStockSchema, type AdjustStockSchema } from "@/features/inventory/schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { AlertTriangle, ArrowUpDown } from "lucide-react";
import type { StockRow, MovementRow } from "@/features/inventory/types";

export default function InventoryPage() {
  const [stock, setStock] = useState<StockRow[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StockRow | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToastEmitter();
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<AdjustStockSchema>({ resolver: zodResolver(adjustStockSchema) });

  const load = useCallback(() => { ipcInvoke<StockRow[]>(IPC_CHANNELS.INVENTORY_GET_ALL).then(setStock).catch(console.error); }, []);
  useEffect(() => { load(); }, [load]);

  const openAdjust = (item: StockRow) => {
    setSelectedProduct(item);
    reset({ productId: item.productId, type: "PURCHASE", quantity: 1 });
    ipcInvoke<MovementRow[]>(IPC_CHANNELS.INVENTORY_GET_MOVEMENTS, item.productId).then(setMovements).catch(console.error);
    setAdjustOpen(true);
  };

  const onAdjust = async (data: AdjustStockSchema) => {
    try {
      await ipcInvoke(IPC_CHANNELS.INVENTORY_ADJUST, data.productId, data.type, data.quantity, data.costPrice ?? 0, undefined, data.note);
      toast({ title: "Stock updated", variant: "success" });
      load(); setAdjustOpen(false);
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  const filtered = stock.filter((s) => s.productName.toLowerCase().includes(search.toLowerCase()));
  const lowCount = stock.filter((s) => s.quantity <= s.lowStockAlert).length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          {lowCount > 0 && <p className="text-sm text-orange-600 flex items-center gap-1 mt-1"><AlertTriangle className="h-3.5 w-3.5" />{lowCount} items below reorder level</p>}
        </div>
        <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Unit</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Alert</TableHead><TableHead className="text-right">Status</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const isLow = item.quantity <= item.lowStockAlert;
                return (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className={`text-right font-semibold ${isLow ? "text-orange-600" : ""}`}>{item.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.lowStockAlert}</TableCell>
                    <TableCell className="text-right"><Badge variant={item.quantity === 0 ? "destructive" : isLow ? "warning" : "success"}>{item.quantity === 0 ? "Out of Stock" : isLow ? "Low" : "OK"}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAdjust(item)}><ArrowUpDown className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={adjustOpen} onOpenChange={(v) => !v && setAdjustOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Adjust Stock — {selectedProduct?.productName}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onAdjust)} className="space-y-4">
            <input type="hidden" {...register("productId", { valueAsNumber: true })} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Controller name="type" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE">Purchase (In)</SelectItem>
                      <SelectItem value="ADJUSTMENT_IN">Adjustment In</SelectItem>
                      <SelectItem value="ADJUSTMENT_OUT">Adjustment Out</SelectItem>
                      <SelectItem value="DAMAGE">Damage / Loss</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5"><Label>Quantity *</Label><Input type="number" min="1" {...register("quantity", { valueAsNumber: true })} />{errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}</div>
              <div className="space-y-1.5"><Label>Cost Price (₹)</Label><Input type="number" step="0.01" min="0" {...register("costPrice", { valueAsNumber: true })} /></div>
              <div className="space-y-1.5"><Label>Note</Label><Input {...register("note")} placeholder="Optional note" /></div>
            </div>
            {movements.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Recent Movements</p>
                <div className="rounded border overflow-hidden max-h-40 overflow-y-auto">
                  <table className="w-full text-xs"><tbody>
                    {movements.slice(0, 8).map((m) => (
                      <tr key={m.id} className="border-b last:border-0"><td className="p-2">{m.type}</td><td className="p-2 text-right">{m.quantity > 0 ? "+" : ""}{m.quantity}</td><td className="p-2 text-muted-foreground">{m.createdAt.slice(0, 10)}</td></tr>
                    ))}
                  </tbody></table>
                </div>
              </div>
            )}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Apply"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
