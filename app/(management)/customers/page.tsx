"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { createCustomerSchema, type CreateCustomerSchema } from "@/features/customers/schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { formatCurrency } from "@/shared/lib/utils";
import { Plus, Search, Pencil, BookOpen } from "lucide-react";
import type { Customer, LedgerEntry } from "@/features/customers/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [ledgerCustomer, setLedgerCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const { toast } = useToastEmitter();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateCustomerSchema>({ resolver: zodResolver(createCustomerSchema) });

  const load = useCallback(() => { ipcInvoke<Customer[]>(IPC_CHANNELS.CUSTOMER_GET_ALL).then(setCustomers).catch(console.error); }, []);
  useEffect(() => { load(); }, [load]);

  const openDialog = (c?: Customer) => {
    setEditing(c ?? null);
    reset(c ? { name: c.name, phone: c.phone ?? "", address: c.address ?? "", creditLimit: c.creditLimit / 100 } : {});
    setDialogOpen(true);
  };

  const onSubmit = async (data: CreateCustomerSchema) => {
    try {
      const payload = { ...data, creditLimit: Math.round((data.creditLimit ?? 0) * 100) };
      if (editing) { await ipcInvoke(IPC_CHANNELS.CUSTOMER_UPDATE, { ...payload, id: editing.id }); toast({ title: "Customer updated", variant: "success" }); }
      else { await ipcInvoke(IPC_CHANNELS.CUSTOMER_CREATE, payload); toast({ title: "Customer added", variant: "success" }); }
      load(); setDialogOpen(false);
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  const openLedger = async (c: Customer) => { setLedgerCustomer(c); setLedger(await ipcInvoke<LedgerEntry[]>(IPC_CHANNELS.CUSTOMER_GET_LEDGER, c.id)); setLedgerOpen(true); };

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone?.includes(search) ?? false));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Customers</h1><Button onClick={() => openDialog()}><Plus className="h-4 w-4 mr-2" />Add Customer</Button></div>
      <Card>
        <CardHeader className="pb-3"><div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" /></div></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead className="text-right">Credit Limit</TableHead><TableHead className="text-right">Outstanding</TableHead><TableHead className="w-20"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No customers found.</TableCell></TableRow> :
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.creditLimit)}</TableCell>
                    <TableCell className="text-right"><span className={c.creditBalance > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>{formatCurrency(c.creditBalance)}</span></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openLedger(c)}><BookOpen className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(c)}><Pencil className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Name *</Label><Input autoFocus {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1.5"><Label>Phone</Label><Input {...register("phone")} placeholder="10-digit mobile" />{errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}</div>
            <div className="space-y-1.5"><Label>Address</Label><Input {...register("address")} /></div>
            <div className="space-y-1.5"><Label>Credit Limit (₹)</Label><Input type="number" step="0.01" min="0" {...register("creditLimit", { valueAsNumber: true })} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : editing ? "Update" : "Add"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={ledgerOpen} onOpenChange={(v) => !v && setLedgerOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{ledgerCustomer?.name} — Ledger</DialogTitle><p className="text-sm text-muted-foreground">Outstanding: <span className="font-semibold text-foreground">{formatCurrency(ledgerCustomer?.creditBalance ?? 0)}</span></p></DialogHeader>
          <div className="max-h-72 overflow-y-auto rounded border">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
              <TableBody>
                {ledger.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No transactions.</TableCell></TableRow> :
                  ledger.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs">{e.createdAt.slice(0, 10)}</TableCell>
                      <TableCell><Badge variant={e.type === "DEBIT" ? "destructive" : "success"}>{e.type}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(e.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.note ?? "—"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
