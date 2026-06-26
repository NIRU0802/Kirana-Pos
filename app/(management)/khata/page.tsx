"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { formatCurrency } from "@/shared/lib/utils";
import { IndianRupee, CheckCircle2 } from "lucide-react";
import type { Customer } from "@/features/customers/types";

const settleFormSchema = z.object({ amount: z.number().positive("Must be > 0"), note: z.string().optional() });
type SettleForm = z.infer<typeof settleFormSchema>;

export default function KhataPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const { toast } = useToastEmitter();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettleForm>({ resolver: zodResolver(settleFormSchema) });

  const load = useCallback(() => {
    ipcInvoke<Customer[]>(IPC_CHANNELS.CUSTOMER_GET_ALL).then((c) => setCustomers(c.filter((x) => x.creditBalance > 0))).catch(console.error);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openSettle = (c: Customer) => { setSelected(c); reset({ amount: c.creditBalance / 100 }); setSettleOpen(true); };

  const onSettle = async (data: SettleForm) => {
    if (!selected) return;
    try {
      await ipcInvoke(IPC_CHANNELS.CUSTOMER_SETTLE, { customerId: selected.id, amount: Math.round(data.amount * 100), note: data.note });
      toast({ title: `Payment recorded for ${selected.name}`, variant: "success" });
      load(); setSettleOpen(false);
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  const totalOutstanding = customers.reduce((s, c) => s + c.creditBalance, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Khata / Udhar</h1><p className="text-sm text-muted-foreground mt-1">Total outstanding: <span className="font-semibold text-red-600">{formatCurrency(totalOutstanding)}</span></p></div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4" />{customers.length} customers with outstanding balance</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead className="text-right">Credit Limit</TableHead><TableHead className="text-right">Outstanding</TableHead><TableHead className="w-28"></TableHead></TableRow></TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground"><CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />All accounts are clear!</TableCell></TableRow>
              ) : customers.map((c) => {
                const pct = c.creditLimit > 0 ? (c.creditBalance / c.creditLimit) * 100 : 0;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.creditLimit)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold text-red-600">{formatCurrency(c.creditBalance)}</span>
                        {c.creditLimit > 0 && <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct > 80 ? "bg-red-500" : "bg-orange-400"}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>}
                      </div>
                    </TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => openSettle(c)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Settle</Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={settleOpen} onOpenChange={(v) => !v && setSettleOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Payment — {selected?.name}</DialogTitle><p className="text-sm text-muted-foreground">Outstanding: <span className="font-semibold">{formatCurrency(selected?.creditBalance ?? 0)}</span></p></DialogHeader>
          <form onSubmit={handleSubmit(onSettle)} className="space-y-4">
            <div className="space-y-1.5"><Label>Amount Paid (₹) *</Label><Input type="number" step="0.01" min="0.01" autoFocus {...register("amount", { valueAsNumber: true })} />{errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
            <div className="space-y-1.5"><Label>Note</Label><Input {...register("note")} placeholder="e.g. Cash payment" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setSettleOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Record Payment"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
