
## FOLDER STRUCTURE

.vs
app
database
electron
features
public
scripts
shared
tests
.vs\kirana-pos
.vs\kirana-pos.slnx
.vs\kirana-pos\CopilotIndices
.vs\kirana-pos\CopilotIndices\18.7.1238.64283
.vs\kirana-pos.slnx\FileContentIndex
.vs\kirana-pos.slnx\v18
app\(management)
app\(pos)
app\login
app\(management)\audit
app\(management)\backup
app\(management)\billing
app\(management)\categories
app\(management)\customers
app\(management)\dashboard
app\(management)\inventory
app\(management)\khata
app\(management)\products
app\(management)\reports
app\(management)\settings
app\(management)\users
database\migrations
database\repositories
database\seeds
electron\ipc
electron\main
electron\preload
features\audit
features\auth
features\backup
features\billing
features\categories
features\customers
features\inventory
features\products
features\reports
features\settings
features\audit\components
features\audit\repositories
features\auth\services
features\auth\types
features\backup\components
features\backup\repositories
features\backup\schemas
features\backup\services
features\backup\types
features\billing\components
features\billing\hooks
features\billing\repositories
features\billing\schemas
features\billing\services
features\billing\stores
features\billing\types
features\categories\components
features\categories\hooks
features\categories\repositories
features\categories\schemas
features\categories\services
features\categories\types
features\customers\components
features\customers\hooks
features\customers\repositories
features\customers\schemas
features\customers\services
features\customers\types
features\inventory\components
features\inventory\hooks
features\inventory\repositories
features\inventory\schemas
features\inventory\services
features\inventory\types
features\products\components
features\products\hooks
features\products\repositories
features\products\schemas
features\products\services
features\products\types
features\reports\components
features\reports\hooks
features\reports\services
features\reports\types
features\settings\components
features\settings\hooks
features\settings\services
features\settings\types
shared\components
shared\hooks
shared\lib
shared\stores
shared\types
shared\components\layout
shared\components\ui
tests\e2e
tests\unit


## FILE CONTENTS


===== FILE: .vs\kirana-pos.slnx\v18\DocumentLayout.json =====

{
  "Version": 1,
  "WorkspaceRootPath": "F:\\kirana-pos\\",
  "Documents": [
    {
      "AbsoluteMoniker": "D:0:0:{A2FE74E1-B743-11D0-AE1A-00A0C90FFFC3}|\u003CMiscFiles\u003E|F:\\kirana-pos\\.env.example||{8B382828-6202-11D1-8870-0000F87579D2}",
      "RelativeMoniker": "D:0:0:{A2FE74E1-B743-11D0-AE1A-00A0C90FFFC3}|\u003CMiscFiles\u003E|solutionrelative:.env.example||{8B382828-6202-11D1-8870-0000F87579D2}"
    },
    {
      "AbsoluteMoniker": "D:0:0:{A2FE74E1-B743-11D0-AE1A-00A0C90FFFC3}|\u003CMiscFiles\u003E|F:\\kirana-pos\\next.config.ts||{3B902123-F8A7-4915-9F01-361F908088D0}",
      "RelativeMoniker": "D:0:0:{A2FE74E1-B743-11D0-AE1A-00A0C90FFFC3}|\u003CMiscFiles\u003E|solutionrelative:next.config.ts||{3B902123-F8A7-4915-9F01-361F908088D0}"
    }
  ],
  "DocumentGroupContainers": [
    {
      "Orientation": 0,
      "VerticalTabListWidth": 256,
      "DocumentGroups": [
        {
          "DockedWidth": 200,
          "SelectedChildIndex": 0,
          "Children": [
            {
              "$type": "Document",
              "DocumentIndex": 0,
              "Title": ".env.example",
              "DocumentMoniker": "F:\\kirana-pos\\.env.example",
              "RelativeDocumentMoniker": ".env.example",
              "ToolTip": "F:\\kirana-pos\\.env.example",
              "RelativeToolTip": ".env.example",
              "ViewState": "AgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
              "Icon": "ae27a6b0-e345-4288-96df-5eaf394ee369.001001|",
              "WhenOpened": "2026-07-11T04:59:07.348Z",
              "EditorCaption": ""
            },
            {
              "$type": "Document",
              "DocumentIndex": 1,
              "Title": "next.config.ts",
              "DocumentMoniker": "F:\\kirana-pos\\next.config.ts",
              "RelativeDocumentMoniker": "next.config.ts",
              "ToolTip": "F:\\kirana-pos\\next.config.ts",
              "RelativeToolTip": "next.config.ts",
              "ViewState": "AgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
              "Icon": "ae27a6b0-e345-4288-96df-5eaf394ee369.003213|",
              "WhenOpened": "2026-07-11T04:58:56.234Z",
              "EditorCaption": ""
            }
          ]
        }
      ]
    }
  ]
}

===== FILE: .vs\ProjectSettings.json =====

{
  "CurrentProjectSetting": null
}

===== FILE: .vs\VSWorkspaceState.json =====

{
  "ExpandedNodes": [
    ""
  ],
  "SelectedNode": "\\.env.example",
  "PreviewInSolutionExplorer": false
}

===== FILE: app\(management)\audit\page.tsx =====

"use client";
import { useState } from "react";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { formatDateTime } from "@/shared/lib/utils";
import type { AuditRow } from "@/features/audit/repositories/audit.repository";

const ACTION_COLORS: Record<string, "default" | "destructive" | "success" | "warning"> = { INSERT: "success", UPDATE: "warning", DELETE: "destructive" };

export default function AuditPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [tableFilter, setTableFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<AuditRow | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const res = await ipcInvoke<{ data: AuditRow[]; total: number }>(IPC_CHANNELS.AUDIT_GET_LOGS, { from, to, table: tableFilter || undefined, action: actionFilter || undefined, limit: 100 });
      setLogs(res.data); setTotal(res.total);
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1"><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" /></div>
            <div className="space-y-1"><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" /></div>
            <div className="space-y-1">
              <Label>Table</Label>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="All tables" /></SelectTrigger>
                <SelectContent><SelectItem value="">All</SelectItem>{["Product","Category","Bill","Customer","Refund","Settings"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="All actions" /></SelectTrigger>
                <SelectContent><SelectItem value="">All</SelectItem><SelectItem value="INSERT">INSERT</SelectItem><SelectItem value="UPDATE">UPDATE</SelectItem><SelectItem value="DELETE">DELETE</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={run} disabled={loading}>{loading ? "Loadingâ€¦" : "Search"}</Button>
          </div>
        </CardContent>
      </Card>
      {logs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Showing {logs.length} of {total} records</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Table</TableHead><TableHead>Action</TableHead><TableHead className="text-right">Record ID</TableHead><TableHead>By</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell className="font-mono text-sm">{log.table}</TableCell>
                    <TableCell><Badge variant={ACTION_COLORS[log.action] ?? "default"}>{log.action}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{log.recordId}</TableCell>
                    <TableCell className="text-muted-foreground">{log.createdBy}</TableCell>
                    <TableCell>{(log.oldData || log.newData) && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDetail(log)}>View</Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{detail?.action} â€” {detail?.table} #{detail?.recordId}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {detail?.oldData && <div><p className="font-semibold mb-2 text-red-600">Before</p><pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">{JSON.stringify(JSON.parse(detail.oldData), null, 2)}</pre></div>}
            {detail?.newData && <div><p className="font-semibold mb-2 text-green-600">After</p><pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">{JSON.stringify(JSON.parse(detail.newData), null, 2)}</pre></div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


===== FILE: app\(management)\backup\page.tsx =====

"use client";
import { useEffect, useState, useCallback } from "react";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { formatDateTime } from "@/shared/lib/utils";
import { Download, RotateCcw, HardDrive } from "lucide-react";
import type { BackupMeta } from "@/features/backup/types";

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const [creating, setCreating] = useState(false);
  const { toast } = useToastEmitter();

  const load = useCallback(() => { ipcInvoke<BackupMeta[]>(IPC_CHANNELS.BACKUP_LIST).then(setBackups).catch(console.error); }, []);
  useEffect(() => { load(); }, [load]);

  const createBackup = async () => {
    setCreating(true);
    try { const meta = await ipcInvoke<BackupMeta>(IPC_CHANNELS.BACKUP_CREATE); toast({ title: "Backup created", description: meta.filename, variant: "success" }); load(); }
    catch (e) { toast({ title: e instanceof Error ? e.message : "Backup failed", variant: "destructive" }); }
    finally { setCreating(false); }
  };

  const restore = async (b: BackupMeta) => {
    if (!confirm(`Restore from "${b.filename}"?\n\nThis will overwrite your current database. A safety copy will be created automatically.`)) return;
    try { await ipcInvoke(IPC_CHANNELS.BACKUP_RESTORE, b.path); toast({ title: "Database restored. Please restart the app.", variant: "success" }); }
    catch (e) { toast({ title: e instanceof Error ? e.message : "Restore failed", variant: "destructive" }); }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Backup & Restore</h1><Button onClick={createBackup} disabled={creating}><Download className="h-4 w-4 mr-2" />{creating ? "Creatingâ€¦" : "Create Backup"}</Button></div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><HardDrive className="h-4 w-4" />Available Backups</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Filename</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Size</TableHead><TableHead className="w-24"></TableHead></TableRow></TableHeader>
            <TableBody>
              {backups.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No backups yet. Create one now.</TableCell></TableRow> :
                backups.map((b) => (
                  <TableRow key={b.filename}>
                    <TableCell className="font-mono text-sm">{b.filename}</TableCell>
                    <TableCell>{formatDateTime(b.createdAt)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{(b.sizeBytes / 1024).toFixed(1)} KB</TableCell>
                    <TableCell><Button variant="ghost" size="sm" className="gap-1.5 text-orange-600" onClick={() => restore(b)}><RotateCcw className="h-3.5 w-3.5" />Restore</Button></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="pt-4 text-sm text-orange-800 dark:text-orange-300 space-y-1">
          <p className="font-semibold">âš ï¸ Restore Warning</p>
          <p>Restoring a backup will replace your entire database. A safety copy is created automatically before restore. Restart the application after restoring.</p>
        </CardContent>
      </Card>
    </div>
  );
}


===== FILE: app\(management)\billing\page.tsx =====

"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { useCartStore } from "@/features/billing/stores/cart.store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { formatCurrency, rupeesToPaise } from "@/shared/lib/utils";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import {
  Barcode, Trash2, Plus, Minus, CreditCard,
  Banknote, Smartphone, Search, X, MessageCircle, User,
} from "lucide-react";
import type { Product } from "@/features/products/types";
import type { Customer } from "@/features/customers/types";
import type { PaymentMethod } from "@/shared/types";
import type { BillResult } from "@/features/billing/services/billing.service";

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  CASH: <Banknote className="h-4 w-4" />,
  UPI: <Smartphone className="h-4 w-4" />,
  CARD: <CreditCard className="h-4 w-4" />,
  CREDIT: <CreditCard className="h-4 w-4" />,
};

export default function BillingPage() {
  // Product search / barcode
  const [barcodeInput, setBarcodeInput] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastEmitter();

  // Payment
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState("0");

  // Customer
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [customerDropOpen, setCustomerDropOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Store name
  const [storeName, setStoreName] = useState("Our Store");

  // WhatsApp dialog
  const [whatsappDialog, setWhatsappDialog] = useState(false);
  const [lastBill, setLastBill] = useState<BillResult | null>(null);
  const [lastItems, setLastItems] = useState<ReturnType<typeof useCartStore.getState>["items"]>([]);

  const {
    items, paymentMethod, setPaymentMethod, addItem, updateQty,
    removeItem, setDiscount: storeSetDiscount, clearCart, getTotals,
  } = useCartStore();
  const totals = getTotals();
  const change = Math.max(0, (parseFloat(amountPaid) * 100 || 0) - totals.grandTotal);

  // Focus barcode on mount
  useEffect(() => { barcodeRef.current?.focus(); }, []);

  // Load store name
  useEffect(() => {
    ipcInvoke<{ storeName: string }>(IPC_CHANNELS.SETTINGS_GET_ALL)
      .then((s) => { if (s.storeName) setStoreName(s.storeName); })
      .catch(() => {});
  }, []);

  // Load ALL products for suggestions panel
  useEffect(() => {
    ipcInvoke<Product[]>(IPC_CHANNELS.PRODUCT_GET_ALL)
      .then((p) => setAllProducts(p.filter((x) => x.stock > 0)))
      .catch(() => {});
  }, []);

  // Barcode enter
  const handleBarcodeEnter = useCallback(async () => {
    if (!barcodeInput.trim()) return;
    try {
      const product = await ipcInvoke<Product | null>(IPC_CHANNELS.PRODUCT_GET_BY_BARCODE, barcodeInput.trim());
      if (!product) toast({ title: "Product not found", description: barcodeInput, variant: "destructive" });
      else if (product.stock <= 0) toast({ title: "Out of stock", description: product.name, variant: "destructive" });
      else addItem({ productId: product.id, productName: product.name, barcode: product.barcode, unit: product.unit, quantity: 1, unitPrice: product.sellingPrice, costPrice: product.costPrice, gstRate: product.gstRate });
      setBarcodeInput("");
    } catch (e) { toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" }); }
  }, [barcodeInput, addItem, toast]);

  // Name search
  const handleNameSearch = useCallback(async (q: string) => {
    setNameQuery(q);
    if (q.length < 1) { setSearchResults([]); setSearchOpen(false); return; }
    const results = await ipcInvoke<Product[]>(IPC_CHANNELS.PRODUCT_SEARCH, q);
    setSearchResults(results);
    setSearchOpen(results.length > 0);
  }, []);

  // Customer search â€” by name OR phone
  const handleCustomerSearch = useCallback(async (q: string) => {
    setCustomerQuery(q);
    if (q.length < 1) { setCustomerResults([]); setCustomerDropOpen(false); return; }
    try {
      const results = await ipcInvoke<Customer[]>(IPC_CHANNELS.CUSTOMER_SEARCH, q);
      setCustomerResults(results);
      setCustomerDropOpen(results.length > 0);
    } catch { setCustomerResults([]); }
  }, []);

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustomerQuery(c.name);
    setCustomerDropOpen(false);
    setPaymentMethod("CREDIT");
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerQuery("");
    setPaymentMethod("CASH");
  };

  const addProduct = (p: Product) => {
    if (p.stock <= 0) { toast({ title: "Out of stock", variant: "destructive" }); return; }
    addItem({ productId: p.id, productName: p.name, barcode: p.barcode, unit: p.unit, quantity: 1, unitPrice: p.sellingPrice, costPrice: p.costPrice, gstRate: p.gstRate });
    setNameQuery(""); setSearchResults([]); setSearchOpen(false);
    barcodeRef.current?.focus();
  };

  useEffect(() => { storeSetDiscount(rupeesToPaise(parseFloat(discount) || 0)); }, [discount, storeSetDiscount]);

  const handleCheckout = async () => {
    if (items.length === 0) { toast({ title: "Cart is empty", variant: "destructive" }); return; }
    if (paymentMethod === "CREDIT" && !selectedCustomer) { toast({ title: "Select a khata customer first", variant: "destructive" }); return; }
    const paid = Math.round((parseFloat(amountPaid) || 0) * 100);
    if (paymentMethod === "CASH" && paid < totals.grandTotal) { toast({ title: "Amount paid is less than total", variant: "destructive" }); return; }

    const itemsSnapshot = [...items];
    try {
      const result = await ipcInvoke<BillResult>(IPC_CHANNELS.BILL_CREATE, {
        customerId: selectedCustomer?.id ?? null,
        items: items.map((i) => ({
          productId: i.productId, productName: i.productName, quantity: i.quantity,
          unitPrice: i.unitPrice, costPrice: i.costPrice, gstRate: i.gstRate,
          gstAmount: i.gstAmount, lineTotal: i.lineTotal,
        })),
        subtotal: totals.subtotal, gstTotal: totals.gstTotal, discount: totals.discount,
        roundOff: totals.roundOff, grandTotal: totals.grandTotal,
        amountPaid: paymentMethod === "CASH" ? paid : totals.grandTotal,
        changeDue: paymentMethod === "CASH" ? change : 0,
        paymentMethod,
      });

      toast({ title: `Bill #${result.billNumber} created`, variant: "success" });

      // Show WhatsApp prompt only if khata customer with outstanding balance
      if (result.customerId && result.customerPhone && result.creditBalance && result.creditBalance > 0) {
        setLastBill(result);
        setLastItems(itemsSnapshot);
        setWhatsappDialog(true);
      }

      clearCart(); setAmountPaid(""); setDiscount("0");
      setSelectedCustomer(null); setCustomerQuery("");
      barcodeRef.current?.focus();
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Billing failed", variant: "destructive" }); }
  };

  const handleSendWhatsApp = async () => {
    if (!lastBill?.customerPhone) return;
    try {
      await ipcInvoke(IPC_CHANNELS.WHATSAPP_OPEN, {
        phone: lastBill.customerPhone,
        customerName: lastBill.customerName ?? "Customer",
        billNumber: lastBill.billNumber,
        storeName,
        items: lastItems.map((i) => ({
          productName: i.productName, quantity: i.quantity,
          unitPrice: i.unitPrice, lineTotal: i.lineTotal,
        })),
        grandTotal: lastItems.reduce((s, i) => s + i.lineTotal, 0),
        creditBalance: lastBill.creditBalance ?? 0,
      });
      toast({ title: "WhatsApp opened!", variant: "success" });
      setWhatsappDialog(false);
    } catch (e) {
      toast({ title: "Could not open WhatsApp", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  // Products to show in suggestion panel (when cart is empty or always)
  const suggestedProducts = nameQuery.length > 0 ? searchResults : allProducts.slice(0, 20);

  return (
    <div className="flex h-full">
      {/* â”€â”€ LEFT: Cart + Search â”€â”€ */}
      <div className="flex-1 flex flex-col border-r min-w-0">
        {/* Search bar */}
        <div className="p-3 border-b space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={barcodeRef}
                className="pl-9"
                placeholder="Scan barcodeâ€¦"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBarcodeEnter()}
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search product by nameâ€¦"
                value={nameQuery}
                onChange={(e) => handleNameSearch(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
              />
            </div>
          </div>
        </div>

        {/* Search dropdown results */}
        {searchOpen && searchResults.length > 0 && (
          <div className="border-b max-h-44 overflow-y-auto bg-background shadow z-10">
            {searchResults.map((p) => (
              <button key={p.id}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-accent text-left text-sm border-b last:border-0"
                onClick={() => addProduct(p)}>
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{p.barcode}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{formatCurrency(p.sellingPrice)}</span>
                  <Badge variant={p.stock > 5 ? "secondary" : p.stock > 0 ? "warning" : "destructive"}>{p.stock} {p.unit}</Badge>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Cart items OR Product Suggestions */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            // Show product suggestions when cart is empty
            <div>
              <p className="text-xs text-muted-foreground px-4 pt-3 pb-1 font-medium uppercase tracking-wide">
                {nameQuery ? "Search Results" : "Quick Add â€” Available Products"}
              </p>
              <div className="grid grid-cols-2 gap-2 p-3">
                {suggestedProducts.map((p) => (
                  <button key={p.id}
                    onClick={() => addProduct(p)}
                    className="text-left rounded-lg border p-3 hover:bg-accent hover:border-primary transition-colors">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-primary font-semibold text-sm mt-0.5">{formatCurrency(p.sellingPrice)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Stock: {p.stock} {p.unit}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Cart table
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Product</th>
                  <th className="text-right px-2 py-2 font-medium w-24">Price</th>
                  <th className="text-center px-2 py-2 font-medium w-28">Qty</th>
                  <th className="text-right px-4 py-2 font-medium w-28">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <p className="font-medium">{item.productName}</p>
                      {item.gstRate > 0 && <p className="text-xs text-muted-foreground">GST {item.gstRate}%</p>}
                    </td>
                    <td className="text-right px-2 py-2">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-center px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.productId, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.productId, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </td>
                    <td className="text-right px-4 py-2 font-medium">{formatCurrency(item.lineTotal)}</td>
                    <td className="px-2 py-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.productId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick-add bar when cart has items */}
        {items.length > 0 && (
          <div className="border-t p-2">
            <p className="text-xs text-muted-foreground mb-1.5 px-1">Quick add more:</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {allProducts.slice(0, 12).map((p) => (
                <button key={p.id}
                  onClick={() => addProduct(p)}
                  className="shrink-0 rounded-md border px-3 py-1.5 text-xs hover:bg-accent hover:border-primary transition-colors text-left">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-primary ml-1">{formatCurrency(p.sellingPrice)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* â”€â”€ RIGHT: Payment sidebar â”€â”€ */}
      <div className="w-80 flex flex-col bg-card shrink-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* Khata Customer Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Khata Customer (optional)
            </Label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-green-50 dark:bg-green-900/20 border-green-300">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">{selectedCustomer.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {selectedCustomer.phone ?? "No phone"} Â· Balance: {formatCurrency(selectedCustomer.creditBalance)}
                  </p>
                </div>
                <button onClick={clearCustomer} className="text-green-600 hover:text-green-800 ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-9 text-sm"
                  placeholder="Name or phone numberâ€¦"
                  value={customerQuery}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  onBlur={() => setTimeout(() => setCustomerDropOpen(false), 150)}
                />
                {customerDropOpen && customerResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-44 overflow-y-auto">
                    {customerResults.map((c) => (
                      <button key={c.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent border-b last:border-0"
                        onMouseDown={() => selectCustomer(c)}>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.phone ?? "No phone"} Â·{" "}
                          <span className={c.creditBalance > 0 ? "text-red-600 font-semibold" : ""}>
                            {c.creditBalance > 0 ? `Owes ${formatCurrency(c.creditBalance)}` : "No balance"}
                          </span>
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>{formatCurrency(totals.gstTotal)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- {formatCurrency(totals.discount)}</span></div>}
              {totals.roundOff !== 0 && <div className="flex justify-between text-muted-foreground"><span>Round Off</span><span>{totals.roundOff > 0 ? "+" : ""}{formatCurrency(Math.abs(totals.roundOff))}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatCurrency(totals.grandTotal)}</span></div>
            </CardContent>
          </Card>

          {/* Discount */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Discount (â‚¹)</Label>
            <Input type="number" step="0.01" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-9" />
          </div>

          {/* Payment method */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Payment</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["CASH", "UPI", "CARD", "CREDIT"] as PaymentMethod[]).map((m) => (
                <Button key={m} variant={paymentMethod === m ? "default" : "outline"} size="sm" className="gap-1.5"
                  onClick={() => setPaymentMethod(m)}>
                  {PAYMENT_ICONS[m]}{m}
                </Button>
              ))}
            </div>
          </div>

          {/* Cash received */}
          {paymentMethod === "CASH" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Amount Received (â‚¹)</Label>
              <Input type="number" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="h-9" placeholder="0.00" />
              {amountPaid && change >= 0 && <p className="text-sm font-medium text-green-600">Change: {formatCurrency(change)}</p>}
            </div>
          )}

          {/* Warnings */}
          {paymentMethod === "CREDIT" && !selectedCustomer && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-md px-3 py-2 border border-orange-200">
              âš ï¸ Select a Khata customer above to use CREDIT payment.
            </p>
          )}
          {selectedCustomer && selectedCustomer.creditBalance > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              ðŸ“’ Current Khata: <span className="font-bold">{formatCurrency(selectedCustomer.creditBalance)}</span>
            </div>
          )}
        </div>

        {/* Checkout buttons */}
        <div className="p-4 border-t space-y-2">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleCheckout}
            disabled={items.length === 0 || (paymentMethod === "CREDIT" && !selectedCustomer)}
          >
            Charge {formatCurrency(totals.grandTotal)}
          </Button>
          <Button variant="outline" className="w-full"
            onClick={() => { clearCart(); setAmountPaid(""); setDiscount("0"); setSelectedCustomer(null); setCustomerQuery(""); }}
            disabled={items.length === 0}>
            Clear Cart
          </Button>
        </div>
      </div>

      {/* â”€â”€ WhatsApp Dialog â”€â”€ */}
      <Dialog open={whatsappDialog} onOpenChange={setWhatsappDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Send Bill on WhatsApp?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Customer has an outstanding Khata balance. Send them this bill + balance reminder.
            </p>
            {lastBill && (
              <div className="rounded-md bg-muted px-4 py-3 space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> <span className="font-semibold">{lastBill.customerName}</span></p>
                <p><span className="text-muted-foreground">Phone:</span> {lastBill.customerPhone}</p>
                <p><span className="text-muted-foreground">This Bill:</span> <span className="font-semibold">{formatCurrency(lastItems.reduce((s, i) => s + i.lineTotal, 0))}</span></p>
                <p><span className="text-muted-foreground">Total Khata Remaining:</span> <span className="font-bold text-red-600">{formatCurrency(lastBill.creditBalance ?? 0)}</span></p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2" onClick={handleSendWhatsApp}>
                <MessageCircle className="h-4 w-4" /> Send WhatsApp
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setWhatsappDialog(false)}>Skip</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

===== FILE: app\(management)\categories\page.tsx =====

"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { categorySchema, type CategorySchema } from "@/features/categories/schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/features/categories/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const { toast } = useToastEmitter();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategorySchema>({ resolver: zodResolver(categorySchema) });

  const load = useCallback(() => { ipcInvoke<Category[]>(IPC_CHANNELS.CATEGORY_GET_ALL).then(setCategories).catch(console.error); }, []);
  useEffect(() => { load(); }, [load]);

  const openDialog = (cat?: Category) => { setEditing(cat ?? null); reset({ name: cat?.name ?? "" }); setDialogOpen(true); };

  const onSubmit = async (data: CategorySchema) => {
    try {
      if (editing) { await ipcInvoke(IPC_CHANNELS.CATEGORY_UPDATE, editing.id, data.name); toast({ title: "Category updated", variant: "success" }); }
      else { await ipcInvoke(IPC_CHANNELS.CATEGORY_CREATE, data.name); toast({ title: "Category created", variant: "success" }); }
      load(); setDialogOpen(false);
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try { await ipcInvoke(IPC_CHANNELS.CATEGORY_DELETE, cat.id); toast({ title: "Category deleted", variant: "success" }); load(); }
    catch (e) { toast({ title: e instanceof Error ? e.message : "Delete failed", variant: "destructive" }); }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => openDialog()}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">{categories.length} categories</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Products</TableHead><TableHead className="w-20"></TableHead></TableRow></TableHeader>
            <TableBody>
              {categories.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No categories yet.</TableCell></TableRow> :
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{cat.productCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Name *</Label><Input autoFocus {...register("name")} placeholder="e.g. Dairy" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Savingâ€¦" : editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


===== FILE: app\(management)\customers\page.tsx =====

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
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { formatCurrency } from "@/shared/lib/utils";
import { Plus, Search, Pencil, BookOpen } from "lucide-react";
import type { Customer, LedgerEntry } from "@/features/customers/types";

// Schema WITHOUT creditLimit
const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile").optional().or(z.literal("")),
  address: z.string().max(500).optional(),
});
type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [ledgerCustomer, setLedgerCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const { toast } = useToastEmitter();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });

  const load = useCallback(() => {
    ipcInvoke<Customer[]>(IPC_CHANNELS.CUSTOMER_GET_ALL).then(setCustomers).catch(console.error);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openDialog = (c?: Customer) => {
    setEditing(c ?? null);
    reset(c ? { name: c.name, phone: c.phone ?? "", address: c.address ?? "" } : { name: "", phone: "", address: "" });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      // creditLimit hardcoded to 0 â€” we don't use it
      const payload = { name: data.name, phone: data.phone || undefined, address: data.address || undefined, creditLimit: 0 };
      if (editing) {
        await ipcInvoke(IPC_CHANNELS.CUSTOMER_UPDATE, { ...payload, id: editing.id });
        toast({ title: "Customer updated", variant: "success" });
      } else {
        await ipcInvoke(IPC_CHANNELS.CUSTOMER_CREATE, payload);
        toast({ title: "Customer added", variant: "success" });
      }
      load(); setDialogOpen(false);
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  const openLedger = async (c: Customer) => {
    setLedgerCustomer(c);
    setLedger(await ipcInvoke<LedgerEntry[]>(IPC_CHANNELS.CUSTOMER_GET_LEDGER, c.id));
    setLedgerOpen(true);
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone?.includes(search) ?? false)
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => openDialog()}><Plus className="h-4 w-4 mr-2" />Add Customer</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or phoneâ€¦" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Outstanding (Khata)</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0
                ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No customers found.</TableCell></TableRow>
                : filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone ?? "â€”"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{c.address ?? "â€”"}</TableCell>
                    <TableCell className="text-right">
                      <span className={c.creditBalance > 0 ? "text-red-600 font-semibold" : "text-muted-foreground"}>
                        {c.creditBalance > 0 ? formatCurrency(c.creditBalance) : "â€”"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openLedger(c)}><BookOpen className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog â€” NO credit limit field */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input autoFocus {...register("name")} placeholder="Customer name" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone (for WhatsApp)</Label>
              <Input {...register("phone")} placeholder="10-digit mobile number" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input {...register("address")} placeholder="Optional" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Savingâ€¦" : editing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ledger Dialog */}
      <Dialog open={ledgerOpen} onOpenChange={(v) => !v && setLedgerOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{ledgerCustomer?.name} â€” Khata Ledger</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Outstanding: <span className="font-semibold text-red-600">{formatCurrency(ledgerCustomer?.creditBalance ?? 0)}</span>
            </p>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0
                  ? <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No transactions.</TableCell></TableRow>
                  : ledger.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs">{e.createdAt.slice(0, 10)}</TableCell>
                      <TableCell>
                        <Badge variant={e.type === "DEBIT" ? "destructive" : "success"}>{e.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(e.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.note ?? "â€”"}</TableCell>
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

===== FILE: app\(management)\dashboard\page.tsx =====

"use client";
import { useEffect, useState } from "react";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { ShoppingCart, Package, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { DailySalesRow, ProductSalesRow } from "@/features/reports/types";
import type { StockRow } from "@/features/inventory/types";

export default function DashboardPage() {
  const [todaySales, setTodaySales] = useState<DailySalesRow | null>(null);
  const [trend, setTrend] = useState<DailySalesRow[]>([]);
  const [lowStock, setLowStock] = useState<StockRow[]>([]);
  const [expiring, setExpiring] = useState<(StockRow & { expiryDate: string; daysLeft: number })[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSalesRow[]>([]);
  const [slowMoving, setSlowMoving] = useState<{ productId: number; productName: string; unit: string; quantity: number; lastSoldAt: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    Promise.all([
      ipcInvoke<DailySalesRow[]>(IPC_CHANNELS.REPORT_DAILY_SALES, today, today),
      ipcInvoke<DailySalesRow[]>(IPC_CHANNELS.REPORT_DAILY_SALES, weekAgo, today),
      ipcInvoke<StockRow[]>(IPC_CHANNELS.INVENTORY_LOW_STOCK),
      ipcInvoke<(StockRow & { expiryDate: string; daysLeft: number })[]>(IPC_CHANNELS.INVENTORY_GET_EXPIRING_SOON),
      ipcInvoke<ProductSalesRow[]>(IPC_CHANNELS.REPORT_PRODUCT_SALES, weekAgo, today),
      ipcInvoke<{ productId: number; productName: string; unit: string; quantity: number; lastSoldAt: string | null }[]>(IPC_CHANNELS.REPORT_SLOW_MOVING, 30),
    ])
      .then(([sales, weekTrend, stock, exp, products, slow]) => {
        setTodaySales(sales[0] ?? null);
        setTrend([...weekTrend].reverse());
        setLowStock(stock);
        setExpiring(exp);
        setTopProducts(products.slice(0, 5));
        setSlowMoving(slow.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Today's Sales", value: formatCurrency(todaySales?.grandTotal ?? 0), sub: `${todaySales?.billCount ?? 0} bills`, icon: TrendingUp, color: "text-primary" },
    { label: "Cash Collected", value: formatCurrency(todaySales?.cashTotal ?? 0), sub: `UPI: ${formatCurrency(todaySales?.upiTotal ?? 0)}`, icon: ShoppingCart, color: "text-green-600" },
    { label: "Today's GST", value: formatCurrency(todaySales?.gstTotal ?? 0), sub: "Tax collected", icon: Package, color: "text-blue-600" },
    { label: "Low Stock", value: String(lowStock.length), sub: "Items need restock", icon: AlertTriangle, color: lowStock.length > 0 ? "text-orange-500" : "text-muted-foreground" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-8 bg-muted animate-pulse rounded" /> : (
                <><div className={`text-2xl font-bold ${color}`}>{value}</div><p className="text-xs text-muted-foreground mt-1">{sub}</p></>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Sales Trend (7 days)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
              <Line type="monotone" dataKey="grandTotal" stroke="#16a34a" strokeWidth={2} dot={false} name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Top Selling Products (7 days)</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No sales yet</p> : (
              <div className="space-y-1">
                {topProducts.map((p) => (
                  <div key={p.productId} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                    <span className="font-medium">{p.productName}</span>
                    <span className="text-muted-foreground">{p.quantitySold} {p.unit} â€¢ {formatCurrency(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Slow Moving Stock (30+ days)</CardTitle></CardHeader>
          <CardContent>
            {slowMoving.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Nothing stagnant ðŸŽ‰</p> : (
              <div className="space-y-1">
                {slowMoving.map((p) => (
                  <div key={p.productId} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                    <span className="font-medium">{p.productName}</span>
                    <span className="text-orange-600">{p.quantity} {p.unit} in stock</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!loading && expiring.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-red-500" />Expiring Soon</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {expiring.slice(0, 10).map((item) => (
                <div key={item.productId} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                  <span className="font-medium">{item.productName}</span>
                  <span className={item.daysLeft <= 7 ? "text-red-600" : "text-orange-600"}>
                    {item.daysLeft <= 0 ? "Expired" : `${item.daysLeft} days left`} ({item.expiryDate})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && lowStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" />Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {lowStock.slice(0, 10).map((item) => (
                <div key={item.productId} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-orange-600">{item.quantity} {item.unit} / min {item.lowStockAlert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

===== FILE: app\(management)\inventory\page.tsx =====

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
        <Input placeholder="Search productsâ€¦" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
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
          <DialogHeader><DialogTitle>Adjust Stock â€” {selectedProduct?.productName}</DialogTitle></DialogHeader>
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
              <div className="space-y-1.5"><Label>Cost Price (â‚¹)</Label><Input type="number" step="0.01" min="0" {...register("costPrice", { valueAsNumber: true })} /></div>
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
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Savingâ€¦" : "Apply"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


===== FILE: app\(management)\khata\page.tsx =====

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
import { IndianRupee, CheckCircle2, MessageCircle } from "lucide-react";
import type { Customer } from "@/features/customers/types";

const settleFormSchema = z.object({ amount: z.number().positive("Must be > 0"), note: z.string().optional() });
type SettleForm = z.infer<typeof settleFormSchema>;

export default function KhataPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const { toast } = useToastEmitter();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettleForm>({
    resolver: zodResolver(settleFormSchema),
  });

  const load = useCallback(() => {
    ipcInvoke<Customer[]>(IPC_CHANNELS.CUSTOMER_GET_ALL)
      .then((c) => setCustomers(c.filter((x) => x.creditBalance > 0)))
      .catch(console.error);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openSettle = (c: Customer) => {
    setSelected(c);
    reset({ amount: c.creditBalance / 100 });
    setSettleOpen(true);
  };

  const onSettle = async (data: SettleForm) => {
    if (!selected) return;
    try {
      await ipcInvoke(IPC_CHANNELS.CUSTOMER_SETTLE, {
        customerId: selected.id,
        amount: Math.round(data.amount * 100),
        note: data.note,
      });
      toast({ title: `Payment recorded for ${selected.name}`, variant: "success" });
      load();
      setSettleOpen(false);
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" });
    }
  };

  const sendWhatsAppReminder = (c: Customer) => {
    if (!c.phone) {
      toast({ title: "No phone number on file for this customer", variant: "destructive" });
      return;
    }
    const amount = (c.creditBalance / 100).toFixed(2);
    const message =
      `Namaste ${c.name} ji ðŸ™\n\n` +
      `Aapka hamare store mein â‚¹${amount} ka udhar baaki hai.\n` +
      `Kripya jaldi se clear kar dijiye.\n\n` +
      `Thank you! ðŸ˜Š`;
    const url = `https://wa.me/91${c.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const totalOutstanding = customers.reduce((s, c) => s + c.creditBalance, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Khata / Udhar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total outstanding:{" "}
            <span className="font-semibold text-red-600">{formatCurrency(totalOutstanding)}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            {customers.length} customers with outstanding balance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Credit Limit</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="w-44 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
                    All accounts are clear!
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => {
                  const pct = c.creditLimit > 0 ? (c.creditBalance / c.creditLimit) * 100 : 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.phone ?? "â€”"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.creditLimit)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-semibold text-red-600">{formatCurrency(c.creditBalance)}</span>
                          {c.creditLimit > 0 && (
                            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct > 80 ? "bg-red-500" : "bg-orange-400"}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendWhatsAppReminder(c)}
                            disabled={!c.phone}
                            title={c.phone ? "Send WhatsApp reminder" : "No phone number on file"}
                          >
                            <MessageCircle className="h-3.5 w-3.5 mr-1 text-green-600" />
                            Remind
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openSettle(c)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Settle
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={settleOpen} onOpenChange={(v) => !v && setSettleOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment â€” {selected?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Outstanding: <span className="font-semibold">{formatCurrency(selected?.creditBalance ?? 0)}</span>
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSettle)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Amount Paid (â‚¹) *</Label>
              <Input type="number" step="0.01" min="0.01" autoFocus {...register("amount", { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Input {...register("note")} placeholder="e.g. Cash payment" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettleOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Savingâ€¦" : "Record Payment"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

===== FILE: app\(management)\products\page.tsx =====

"use client";
import { useEffect, useState, useCallback } from "react";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { Product } from "@/features/products/types";
import { ProductDialog } from "@/features/products/components/product-dialog";
import { useToastEmitter } from "@/shared/hooks/use-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const { toast } = useToastEmitter();

  const load = useCallback(() => {
    ipcInvoke<Product[]>(IPC_CHANNELS.PRODUCT_GET_ALL).then(setProducts)
      .catch(() => toast({ title: "Failed to load products", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode?.includes(search) ?? false));

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await ipcInvoke(IPC_CHANNELS.PRODUCT_DELETE, p.id); toast({ title: "Product deleted", variant: "success" }); load(); }
    catch (e) { toast({ title: e instanceof Error ? e.message : "Delete failed", variant: "destructive" }); }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name or barcodeâ€¦" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" /></div></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Barcode</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">MRP</TableHead><TableHead className="text-right">GST%</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="w-20"></TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? [...Array(5)].map((_, i) => (
                <TableRow key={i}>{[...Array(9)].map((__, j) => <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>)}</TableRow>
              )) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{search ? "No products match your search" : "No products yet. Add one!"}</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{p.barcode ?? "â€”"}</TableCell>
                  <TableCell>{p.categoryName ?? "â€”"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.costPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.sellingPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.mrp)}</TableCell>
                  <TableCell className="text-right">{p.gstRate}%</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${p.stock <= p.lowStockAlert ? "text-orange-500" : ""}`}>
                      {p.stock <= p.lowStockAlert && <AlertTriangle className="h-3 w-3 inline mr-1" />}{p.stock} {p.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(p); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && <div className="px-4 py-3 border-t text-sm text-muted-foreground">{filtered.length} of {products.length} products</div>}
        </CardContent>
      </Card>
      <ProductDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditing(null); }} product={editing} onSaved={load} />
    </div>
  );
}


===== FILE: app\(management)\reports\page.tsx =====

"use client";
import { useState } from "react";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { formatCurrency, formatDate } from "@/shared/lib/utils";
import type { DailySalesRow, ProductSalesRow, GstRow } from "@/features/reports/types";

type Tab = "daily" | "products" | "gst" | "pl";
type PL = { revenue: number; cost: number; grossProfit: number; refunds: number; netProfit: number; margin: number };

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [tab, setTab] = useState<Tab>("daily");
  const [daily, setDaily] = useState<DailySalesRow[]>([]);
  const [products, setProductSales] = useState<ProductSalesRow[]>([]);
  const [gst, setGst] = useState<GstRow[]>([]);
  const [pl, setPl] = useState<PL | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      if (tab === "daily") setDaily(await ipcInvoke<DailySalesRow[]>(IPC_CHANNELS.REPORT_DAILY_SALES, from, to));
      if (tab === "products") setProductSales(await ipcInvoke<ProductSalesRow[]>(IPC_CHANNELS.REPORT_PRODUCT_SALES, from, to));
      if (tab === "gst") setGst(await ipcInvoke<GstRow[]>(IPC_CHANNELS.REPORT_GST, from, to));
      if (tab === "pl") setPl(await ipcInvoke<PL>(IPC_CHANNELS.REPORT_PROFIT_LOSS, from, to));
    } finally { setLoading(false); }
  };

  const TABS: { key: Tab; label: string }[] = [{ key: "daily", label: "Daily Sales" }, { key: "products", label: "Product Sales" }, { key: "gst", label: "GST Summary" }, { key: "pl", label: "Profit & Loss" }];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1"><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" /></div>
            <div className="space-y-1"><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" /></div>
            <div className="flex gap-1 flex-wrap">{TABS.map((t) => <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm" onClick={() => setTab(t.key)}>{t.label}</Button>)}</div>
            <Button onClick={run} disabled={loading}>{loading ? "Loadingâ€¦" : "Run Report"}</Button>
          </div>
        </CardContent>
      </Card>
      {tab === "daily" && daily.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Daily Sales â€” {from} to {to}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead className="text-right">Bills</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead className="text-right">GST</TableHead><TableHead className="text-right">Discount</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Cash</TableHead><TableHead className="text-right">UPI</TableHead></TableRow></TableHeader>
              <TableBody>
                {daily.map((r) => (
                  <TableRow key={r.date}>
                    <TableCell>{formatDate(r.date)}</TableCell><TableCell className="text-right">{r.billCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.subtotal)}</TableCell><TableCell className="text-right">{formatCurrency(r.gstTotal)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(r.discount)}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(r.grandTotal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.cashTotal)}</TableCell><TableCell className="text-right">{formatCurrency(r.upiTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {tab === "products" && products.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Product Sales â€” {from} to {to}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Profit</TableHead><TableHead className="text-right">Margin</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map((r) => (
                  <TableRow key={r.productId}>
                    <TableCell className="font-medium">{r.productName}</TableCell><TableCell className="text-right">{r.quantitySold} {r.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.revenue)}</TableCell><TableCell className="text-right">{formatCurrency(r.cost)}</TableCell>
                    <TableCell className={`text-right font-medium ${r.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(r.profit)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{r.revenue > 0 ? ((r.profit / r.revenue) * 100).toFixed(1) : 0}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {tab === "gst" && gst.length > 0 && (
        <Card>
          <CardHeader><CardTitle>GST Summary â€” {from} to {to}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>GST Rate</TableHead><TableHead className="text-right">Taxable Amount</TableHead><TableHead className="text-right">GST Collected</TableHead></TableRow></TableHeader>
              <TableBody>{gst.map((r) => (<TableRow key={r.gstRate}><TableCell className="font-medium">{r.gstRate}%</TableCell><TableCell className="text-right">{formatCurrency(r.taxableAmount)}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(r.gstAmount)}</TableCell></TableRow>))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {tab === "pl" && pl && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[{ label: "Revenue", value: formatCurrency(pl.revenue), color: "text-blue-600" },
            { label: "Cost of Goods", value: formatCurrency(pl.cost), color: "text-orange-600" },
            { label: "Gross Profit", value: formatCurrency(pl.grossProfit), color: pl.grossProfit >= 0 ? "text-green-600" : "text-red-600" },
            { label: "Refunds", value: formatCurrency(pl.refunds), color: "text-red-500" },
            { label: "Net Profit", value: formatCurrency(pl.netProfit), color: pl.netProfit >= 0 ? "text-green-700" : "text-red-700" },
            { label: "Margin", value: `${pl.margin.toFixed(2)}%`, color: "text-primary" }].map(({ label, value, color }) => (
            <Card key={label}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${color}`}>{value}</p></CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}


===== FILE: app\(management)\settings\page.tsx =====

"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { useAppStore } from "@/shared/stores/app.store";
import type { AppSettings } from "@/features/settings/types";

export default function SettingsPage() {
  const { toast } = useToastEmitter();
  const { setTheme, theme } = useAppStore();
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<AppSettings>();
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreConfirmText, setRestoreConfirmText] = useState("");

  useEffect(() => { ipcInvoke<AppSettings>(IPC_CHANNELS.SETTINGS_GET_ALL).then(reset).catch(console.error); }, [reset]);

  const onSubmit = async (data: AppSettings) => {
    try { await ipcInvoke(IPC_CHANNELS.SETTINGS_UPDATE, data); toast({ title: "Settings saved", variant: "success" }); }
    catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  const fields: { key: keyof AppSettings; label: string; placeholder?: string }[] = [
    { key: "storeName", label: "Store Name", placeholder: "My Kirana Store" },
    { key: "storeAddress", label: "Store Address", placeholder: "123, Main Street" },
    { key: "storePhone", label: "Store Phone", placeholder: "9876543210" },
    { key: "storeGstin", label: "GSTIN", placeholder: "22AAAAA0000A1Z5" },
    { key: "billPrefix", label: "Bill Number Prefix", placeholder: "INV" },
    { key: "printerName", label: "Printer Name", placeholder: "Leave blank for default" },
    { key: "printerWidth", label: "Printer Width (mm)", placeholder: "80" },
  ];

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Store Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">{fields.map(({ key, label, placeholder }) => (<div key={key} className="space-y-1.5"><Label>{label}</Label><Input {...register(key)} placeholder={placeholder} /></div>))}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
          <CardContent><div className="flex gap-2"><Button type="button" variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>Light</Button><Button type="button" variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>Dark</Button></div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Data Safety / Backup to Excel & Sheets</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Excel Export Folder</Label>
              <div className="flex gap-2">
                <Input {...register("excelExportFolderPath")} readOnly placeholder="No folder selected" />
                <Button type="button" variant="outline" onClick={async () => {
                  const path = await ipcInvoke<string | null>(IPC_CHANNELS.BACKUP_PICK_EXPORT_FOLDER);
                  if (path) { reset((prev) => ({ ...prev, excelExportFolderPath: path })); }
                }}>Choose Folder</Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Enable Google Sheets backup</Label>
              <input type="checkbox" {...register("googleSheetsEnabled")} className="h-4 w-4" />
            </div>

            <div className="space-y-1.5">
              <Label>Service Account Credentials File</Label>
              <div className="flex gap-2">
                <Input {...register("googleSheetsCredentialsPath")} readOnly placeholder="No file selected" />
                <Button type="button" variant="outline" onClick={async () => {
                  const path = await ipcInvoke<string | null>(IPC_CHANNELS.BACKUP_PICK_CREDENTIALS_FILE);
                  if (path) { reset((prev) => ({ ...prev, googleSheetsCredentialsPath: path })); }
                }}>Choose File</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Spreadsheet ID</Label>
              <Input {...register("googleSheetsSpreadsheetId")} placeholder="Paste the Google Sheet ID here" />
            </div>

            <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
              <p>Last daily sync (local): {watch("lastDailySyncAt") || "Never"}</p>
              <p>Last monthly merge: {watch("lastMonthlySyncAt") || "Never"}</p>
              <p>
                Last online backup:{" "}
                {watch("googleSheetsEnabled") === "true"
                  ? (watch("lastDailySyncAt") ? watch("lastDailySyncAt") : "Failed / Not attempted")
                  : "Disabled"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" disabled={syncing} onClick={async () => {
                setSyncing(true);
                try {
                  await ipcInvoke(IPC_CHANNELS.SYNC_NOW);
                  toast({ title: "Sync complete", variant: "success" });
                  ipcInvoke<AppSettings>(IPC_CHANNELS.SETTINGS_GET_ALL).then(reset).catch(console.error);
                } catch (e) {
                  toast({ title: e instanceof Error ? e.message : "Sync failed", variant: "destructive" });
                } finally {
                  setSyncing(false);
                }
              }}>{syncing ? "Syncingâ€¦" : "Sync Now"}</Button>

              <Button type="button" variant="outline" disabled={syncing} onClick={async () => {
                setSyncing(true);
                try {
                  await ipcInvoke(IPC_CHANNELS.SYNC_MERGE_MONTH);
                  toast({ title: "Monthly merge complete", variant: "success" });
                  ipcInvoke<AppSettings>(IPC_CHANNELS.SETTINGS_GET_ALL).then(reset).catch(console.error);
                } catch (e) {
                  toast({ title: e instanceof Error ? e.message : "Merge failed", variant: "destructive" });
                } finally {
                  setSyncing(false);
                }
              }}>Merge This Month Now</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-300 bg-red-50">
          <CardHeader><CardTitle className="text-base text-red-700">Disaster Recovery</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-700">
              This will overwrite your current local Products and Customers data with whatever is
              currently in your Google Sheet. Only use this if your local database is lost or corrupted.
              A safety snapshot of your current database is taken automatically before this runs.
            </p>
            <div className="space-y-1.5">
              <Label>Type RESTORE to confirm</Label>
              <Input value={restoreConfirmText} onChange={(e) => setRestoreConfirmText(e.target.value)} placeholder="RESTORE" />
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={restoreConfirmText !== "RESTORE" || restoring}
              onClick={async () => {
                setRestoring(true);
                try {
                  const result = await ipcInvoke<{ restored: Record<string, number> }>(IPC_CHANNELS.SYNC_RESTORE_FROM_SHEETS);
                  toast({
                    title: `Restored ${result.restored["products"] ?? 0} products, ${result.restored["customers"] ?? 0} customers`,
                    variant: "success",
                  });
                  setRestoreConfirmText("");
                } catch (e) {
                  toast({ title: e instanceof Error ? e.message : "Restore failed", variant: "destructive" });
                } finally {
                  setRestoring(false);
                }
              }}
            >
              {restoring ? "Restoringâ€¦" : "Restore from Google Sheets"}
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Savingâ€¦" : "Save Settings"}</Button>
      </form>
    </div>
  );
}

===== FILE: app\(management)\users\page.tsx =====

"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { useAppStore } from "@/shared/stores/app.store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { UserCog, Plus, Pencil, Trash2, KeyRound, ShieldAlert } from "lucide-react";
import type { UserRow, UserRole } from "@/features/auth/types";

const ROLES: UserRole[] = ["admin", "manager", "staff", "cashier"];

const ROLE_COLORS: Record<UserRole, string> = {
  admin:   "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  staff:   "bg-green-100 text-green-700",
  cashier: "bg-orange-100 text-orange-700",
};

const createSchema = z.object({
  username: z.string().min(3, "Min 3 chars").max(50).regex(/^[a-z0-9_]+$/, "Lowercase, numbers, underscore only"),
  password: z.string().min(6, "Min 6 chars"),
  role: z.enum(["admin", "manager", "staff", "cashier"]),
});

const editSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-z0-9_]+$/),
  role: z.enum(["admin", "manager", "staff", "cashier"]),
  isActive: z.boolean(),
});

const resetSchema = z.object({
  password: z.string().min(6, "Min 6 chars"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function UsersPage() {
  const { user: currentUser } = useAppStore();
  const { toast } = useToastEmitter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    ipcInvoke<UserRow[]>(IPC_CHANNELS.AUTH_GET_ALL_USERS)
      .then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema), defaultValues: { role: "cashier" } });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  // â”€â”€ guard â€” after all hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (currentUser?.role !== "admin") {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <ShieldAlert className="h-10 w-10" />
        <p className="text-lg font-medium">Admin access only</p>
      </div>
    );
  }

  // â”€â”€ Create â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onCreate = async (data: CreateForm) => {
    try {
      await ipcInvoke(IPC_CHANNELS.AUTH_CREATE_USER, data);
      toast({ title: `User "${data.username}" created`, variant: "success" });
      load(); setCreateOpen(false); createForm.reset({ role: "cashier" });
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  // â”€â”€ Edit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openEdit = (u: UserRow) => {
    setEditTarget(u);
    editForm.reset({ username: u.username, role: u.role, isActive: u.isActive === 1 });
  };
  const onEdit = async (data: EditForm) => {
    if (!editTarget) return;
    try {
      await ipcInvoke(IPC_CHANNELS.AUTH_UPDATE_USER, { id: editTarget.id, ...data });
      toast({ title: "User updated", variant: "success" });
      load(); setEditTarget(null);
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  // â”€â”€ Reset password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onReset = async (data: ResetForm) => {
    if (!resetTarget) return;
    try {
      await ipcInvoke(IPC_CHANNELS.AUTH_RESET_PASSWORD, resetTarget.id, data.password);
      toast({ title: `Password reset for "${resetTarget.username}"`, variant: "success" });
      setResetTarget(null); resetForm.reset();
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  // â”€â”€ Delete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await ipcInvoke(IPC_CHANNELS.AUTH_DELETE_USER, deleteTarget.id);
      toast({ title: `User "${deleteTarget.username}" deactivated`, variant: "success" });
      load(); setDeleteTarget(null);
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><UserCog className="h-6 w-6" />User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage staff accounts and roles</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{users.length} users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-36 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loadingâ€¦</TableCell></TableRow>
              ) : users.map((u) => (
                <TableRow key={u.id} className={u.isActive === 0 ? "opacity-50" : ""}>
                  <TableCell className="font-medium">
                    {u.username}
                    {u.id === currentUser?.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${u.isActive === 1 ? "text-green-600" : "text-muted-foreground"}`}>
                      {u.isActive === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.createdAt.slice(0, 10)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(u)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { setResetTarget(u); resetForm.reset(); }} title="Reset password"><KeyRound className="h-3.5 w-3.5" /></Button>
                      {u.role !== "admin" && u.id !== currentUser?.id && (
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(u)} title="Deactivate">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* â”€â”€ Create dialog â”€â”€ */}
      <Dialog open={createOpen} onOpenChange={(v) => !v && setCreateOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Username *</Label>
              <Input {...createForm.register("username")} placeholder="e.g. staff1" autoFocus />
              {createForm.formState.errors.username && <p className="text-xs text-destructive">{createForm.formState.errors.username.message}</p>}
              <p className="text-xs text-muted-foreground">Lowercase letters, numbers, underscore only</p>
            </div>
            <div className="space-y-1.5">
              <Label>Password *</Label>
              <Input type="password" {...createForm.register("password")} placeholder="Min 6 characters" />
              {createForm.formState.errors.password && <p className="text-xs text-destructive">{createForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Controller name="role" control={createForm.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                {createForm.formState.isSubmitting ? "Creatingâ€¦" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Edit dialog â”€â”€ */}
      <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit â€” {editTarget?.username}</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Username *</Label>
              <Input {...editForm.register("username")} />
              {editForm.formState.errors.username && <p className="text-xs text-destructive">{editForm.formState.errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Controller name="role" control={editForm.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...editForm.register("isActive")} className="h-4 w-4" />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                {editForm.formState.isSubmitting ? "Savingâ€¦" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Reset password dialog â”€â”€ */}
      <Dialog open={!!resetTarget} onOpenChange={(v) => !v && setResetTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reset Password â€” {resetTarget?.username}</DialogTitle></DialogHeader>
          <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>New Password *</Label>
              <Input type="password" {...resetForm.register("password")} autoFocus placeholder="Min 6 characters" />
              {resetForm.formState.errors.password && <p className="text-xs text-destructive">{resetForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password *</Label>
              <Input type="password" {...resetForm.register("confirm")} placeholder="Repeat password" />
              {resetForm.formState.errors.confirm && <p className="text-xs text-destructive">{resetForm.formState.errors.confirm.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting ? "Resettingâ€¦" : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Delete confirm dialog â”€â”€ */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Deactivate User?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will deactivate <span className="font-semibold">{deleteTarget?.username}</span>. They won&apos;t be able to log in anymore. You can reactivate them later from Edit.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={onDelete}>Deactivate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

===== FILE: app\(management)\layout.tsx =====

import { ManagementLayout } from "@/shared/components/layout/management-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ManagementLayout>{children}</ManagementLayout>;
}


===== FILE: app\login\page.tsx =====

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { useAppStore, type AuthUser } from "@/shared/stores/app.store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const schema = z.object({ username: z.string().min(1, "Required"), password: z.string().min(1, "Required") });
type Schema = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Schema>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Schema) => {
    setError("");
    try {
      const user = await ipcInvoke<AuthUser>(IPC_CHANNELS.AUTH_LOGIN, data);
      setUser(user);
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">ðŸ›’</div>
          <CardTitle className="text-2xl">KiranaPOS</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" autoFocus {...register("username")} placeholder="admin" />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing inâ€¦" : "Sign In"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


===== FILE: app\globals.css =====

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%; --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%; --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%; --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%; --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%; --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%; --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%; --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%; --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%; --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%; --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%; --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%; --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%; --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%; --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%; --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%; --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%; --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%; --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%; --input: 217.2 32.6% 17.5%; --ring: 212.7 26.8% 83.9%;
  }
}
@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}


===== FILE: app\layout.tsx =====

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = { title: "KiranaPOS", description: "Offline-first POS for kirana stores" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}


===== FILE: app\page.tsx =====

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/shared/stores/app.store";

export default function Root() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  useEffect(() => { router.replace(user ? "/dashboard" : "/login"); }, [user, router]);
  return null;
}


===== FILE: database\migrations\001_initial.sql =====

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'cashier',
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS Category (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS Product (
  id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT UNIQUE, name TEXT NOT NULL,
  description TEXT, categoryId INTEGER REFERENCES Category(id),
  unit TEXT NOT NULL DEFAULT 'PCS', costPrice INTEGER NOT NULL DEFAULT 0,
  sellingPrice INTEGER NOT NULL, mrp INTEGER NOT NULL, gstRate INTEGER NOT NULL DEFAULT 0,
  hsnCode TEXT, isActive INTEGER NOT NULL DEFAULT 1, lowStockAlert INTEGER NOT NULL DEFAULT 10,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_product_barcode ON Product(barcode);
CREATE INDEX IF NOT EXISTS idx_product_name ON Product(name);
CREATE TABLE IF NOT EXISTS Stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL UNIQUE REFERENCES Product(id),
  quantity INTEGER NOT NULL DEFAULT 0, updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS StockMovement (
  id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL REFERENCES Product(id),
  type TEXT NOT NULL, quantity INTEGER NOT NULL, costPrice INTEGER NOT NULL DEFAULT 0,
  referenceId INTEGER, note TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), createdBy TEXT NOT NULL DEFAULT 'system'
);
CREATE INDEX IF NOT EXISTS idx_sm_product ON StockMovement(productId);
CREATE TABLE IF NOT EXISTS Customer (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT UNIQUE,
  address TEXT, creditLimit INTEGER NOT NULL DEFAULT 0, creditBalance INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON Customer(phone);
CREATE TABLE IF NOT EXISTS Bill (
  id INTEGER PRIMARY KEY AUTOINCREMENT, billNumber TEXT NOT NULL UNIQUE,
  customerId INTEGER REFERENCES Customer(id), status TEXT NOT NULL DEFAULT 'COMPLETED',
  subtotal INTEGER NOT NULL, gstTotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0,
  roundOff INTEGER NOT NULL DEFAULT 0, grandTotal INTEGER NOT NULL,
  amountPaid INTEGER NOT NULL, changeDue INTEGER NOT NULL DEFAULT 0,
  paymentMethod TEXT NOT NULL, note TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  createdBy TEXT NOT NULL DEFAULT 'system'
);
CREATE INDEX IF NOT EXISTS idx_bill_number ON Bill(billNumber);
CREATE INDEX IF NOT EXISTS idx_bill_created ON Bill(createdAt);
CREATE TABLE IF NOT EXISTS BillItem (
  id INTEGER PRIMARY KEY AUTOINCREMENT, billId INTEGER NOT NULL REFERENCES Bill(id),
  productId INTEGER NOT NULL REFERENCES Product(id), productName TEXT NOT NULL,
  quantity INTEGER NOT NULL, unitPrice INTEGER NOT NULL, costPrice INTEGER NOT NULL,
  gstRate INTEGER NOT NULL, gstAmount INTEGER NOT NULL, lineTotal INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bi_bill ON BillItem(billId);
CREATE TABLE IF NOT EXISTS Refund (
  id INTEGER PRIMARY KEY AUTOINCREMENT, billId INTEGER NOT NULL REFERENCES Bill(id),
  amount INTEGER NOT NULL, reason TEXT NOT NULL, refundedBy TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS CreditLedger (
  id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL REFERENCES Customer(id),
  type TEXT NOT NULL, amount INTEGER NOT NULL, billId INTEGER, note TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cl_customer ON CreditLedger(customerId);
CREATE TABLE IF NOT EXISTS Settings (
  key TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL, updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS AuditLog (
  id INTEGER PRIMARY KEY AUTOINCREMENT, "table" TEXT NOT NULL, action TEXT NOT NULL,
  recordId INTEGER NOT NULL, oldData TEXT, newData TEXT,
  createdBy TEXT NOT NULL DEFAULT 'system', createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_table ON AuditLog("table", recordId);
CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL UNIQUE,
  appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default admin (password: admin123)
INSERT OR IGNORE INTO User(username, passwordHash, role) VALUES
  ('admin', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3:hashed', 'admin');

INSERT OR IGNORE INTO Settings(key, value) VALUES
  ('storeName','My Kirana Store'),('storeAddress',''),('storePhone',''),
  ('storeGstin',''),('currency','INR'),('billPrefix','INV'),('billCounter','1'),
  ('taxIncluded','false'),('printReceiptAuto','true'),('theme','light'),
  ('printerName',''),('printerWidth','80');

INSERT OR IGNORE INTO Category(name) VALUES ('Groceries'),('Dairy'),('Beverages'),('Snacks'),('Personal Care'),('Household');


===== FILE: database\migrations\002_add_backup_sync_settings.sql =====

INSERT OR IGNORE INTO Settings(key, value) VALUES
  ('excelExportFolderPath', ''),
  ('lastDailySyncAt', ''),
  ('lastMonthlySyncAt', ''),
  ('googleSheetsEnabled', 'false'),
  ('googleSheetsCredentialsPath', ''),
  ('googleSheetsSpreadsheetId', '');


===== FILE: database\migrations\003_add_expiry_tracking.sql =====

ALTER TABLE Product ADD COLUMN expiryDate TEXT;
ALTER TABLE Product ADD COLUMN expiryAlertDays INTEGER NOT NULL DEFAULT 30;

CREATE INDEX IF NOT EXISTS idx_product_expiry ON Product(expiryDate);

===== FILE: database\migrations\004_user_management.sql =====

ALTER TABLE User ADD COLUMN IF NOT EXISTS updatedAt TEXT NOT NULL DEFAULT (datetime('now'));

INSERT OR IGNORE INTO User(username, passwordHash, role, createdAt, updatedAt) VALUES
  ('manager', 'changeme:changeme', 'manager', datetime('now'), datetime('now')),
  ('cashier1', 'changeme:changeme', 'cashier', datetime('now'), datetime('now'));

===== FILE: database\repositories\base.repository.ts =====

import Database from "better-sqlite3";
import { getDatabase } from "../client";

export abstract class BaseRepository {
  protected get db(): Database.Database { return getDatabase(); }
  protected transaction<T>(fn: () => T): T { return this.db.transaction(fn)(); }
  protected buildSet(fields: Record<string, unknown>): { set: string; vals: unknown[] } {
    const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
    return { set: entries.map(([k]) => `"${k}" = ?`).join(", "), vals: entries.map(([, v]) => v) };
  }
  protected audit(table: string, action: "INSERT" | "UPDATE" | "DELETE", recordId: number, oldData: unknown, newData: unknown, createdBy = "system"): void {
    this.db.prepare(`INSERT INTO AuditLog("table",action,recordId,oldData,newData,createdBy) VALUES (?,?,?,?,?,?)`)
      .run(table, action, recordId, oldData ? JSON.stringify(oldData) : null, newData ? JSON.stringify(newData) : null, createdBy);
  }
}


===== FILE: database\seeds\index.ts =====

import { getDatabase } from "../client";
import { runMigrations } from "../migrate";

const db = getDatabase();
runMigrations(db);

const products = [
  { barcode: "8901030870018", name: "Tata Salt 1kg", categoryId: 1, unit: "PKT", costPrice: 1800, sellingPrice: 2000, mrp: 2200, gstRate: 0 },
  { barcode: "8901030000018", name: "Amul Butter 100g", categoryId: 2, unit: "PKT", costPrice: 4800, sellingPrice: 5200, mrp: 5500, gstRate: 5 },
  { barcode: "8906006460025", name: "Parle-G Biscuits 70g", categoryId: 4, unit: "PKT", costPrice: 500, sellingPrice: 600, mrp: 700, gstRate: 5 },
  { barcode: "8901063023536", name: "Coca Cola 750ml", categoryId: 3, unit: "BTL", costPrice: 3800, sellingPrice: 4000, mrp: 4500, gstRate: 28 },
  { barcode: "8901520100046", name: "Dettol Soap 75g", categoryId: 5, unit: "PCS", costPrice: 3500, sellingPrice: 3800, mrp: 4200, gstRate: 18 },
];

const now = new Date().toISOString();
for (const p of products) {
  const r = db.prepare(
    `INSERT OR IGNORE INTO Product(barcode,name,categoryId,unit,costPrice,sellingPrice,mrp,gstRate,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(p.barcode, p.name, p.categoryId, p.unit, p.costPrice, p.sellingPrice, p.mrp, p.gstRate, now, now);
  if (r.lastInsertRowid) {
    db.prepare("INSERT OR IGNORE INTO Stock(productId,quantity,updatedAt) VALUES (?,?,?)").run(r.lastInsertRowid, 100, now);
  }
}
console.log("âœ… Seed complete");


===== FILE: database\client.ts =====

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let _db: Database.Database | null = null;

export function getDbPath(): string {
  if (process.env["NODE_ENV"] === "test") return ":memory:";
  const base = process.env["APPDATA"] ?? process.env["HOME"] ?? ".";
  const dir = path.join(base, "KiranaPOS", "database");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "kirana.db");
}

export function getDatabase(): Database.Database {
  if (_db) return _db;
  _db = new Database(getDbPath());
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.pragma("synchronous = NORMAL");
  _db.pragma("cache_size = -32000");
  _db.pragma("temp_store = MEMORY");
  return _db;
}

export function closeDatabase(): void { _db?.close(); _db = null; }

export function withTransaction<T>(fn: (db: Database.Database) => T): T {
  const db = getDatabase();
  return db.transaction(() => fn(db))();
}


===== FILE: database\migrate.ts =====

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { app } from "electron";

function getMigrationsDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "database", "migrations");
  }
  // Dev mode: __dirname is electron/dist/database, so go up to project root
  return path.join(__dirname, "../../../database/migrations");
}

export function runMigrations(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL UNIQUE, appliedAt TEXT NOT NULL DEFAULT (datetime('now')))`);
  const dir = getMigrationsDir();
  console.log("[Migration] Looking for migrations in:", dir);
  if (!fs.existsSync(dir)) {
    console.error("[Migration] Directory not found:", dir);
    return;
  }
  const applied = new Set((db.prepare("SELECT filename FROM _migrations").all() as { filename: string }[]).map((r) => r.filename));
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (applied.has(file)) continue;
    db.transaction(() => { db.exec(fs.readFileSync(path.join(dir, file), "utf-8")); db.prepare("INSERT INTO _migrations(filename) VALUES (?)").run(file); })();
    console.log(`[Migration] ${file}`);
  }
}

===== FILE: electron\ipc\audit.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { AuditRepository } from "../../features/audit/repositories/audit.repository";
import type { AuditFilters } from "../../features/audit/repositories/audit.repository";

const repo = new AuditRepository();

export function registerAuditHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.AUDIT_GET_LOGS, safeHandle((_e, filters) => repo.getLogs(filters as AuditFilters)));
}


===== FILE: electron\ipc\auth.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { AuthService } from "../../features/auth/services/auth.service";
import type { LoginInput, ChangePasswordInput, CreateUserInput, UpdateUserInput } from "../../features/auth/types";

const svc = new AuthService();

export function registerAuthHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN,           safeHandle((_e, input) => svc.login(input as LoginInput)));
  ipcMain.handle(IPC_CHANNELS.AUTH_CURRENT_USER,    safeHandle((_e, id) => svc.getCurrentUser(id as number)));
  ipcMain.handle(IPC_CHANNELS.AUTH_CHANGE_PASSWORD, safeHandle((_e, input) => svc.changePassword(input as ChangePasswordInput)));
  ipcMain.handle(IPC_CHANNELS.AUTH_GET_ALL_USERS,   safeHandle(() => svc.getAllUsers()));
  ipcMain.handle(IPC_CHANNELS.AUTH_CREATE_USER,     safeHandle((_e, input) => svc.createUser(input as CreateUserInput)));
  ipcMain.handle(IPC_CHANNELS.AUTH_UPDATE_USER,     safeHandle((_e, input) => svc.updateUser(input as UpdateUserInput)));
  ipcMain.handle(IPC_CHANNELS.AUTH_RESET_PASSWORD,  safeHandle((_e, id, pwd) => svc.resetPassword(id as number, pwd as string)));
  ipcMain.handle(IPC_CHANNELS.AUTH_DELETE_USER,     safeHandle((_e, id) => svc.deleteUser(id as number)));
}

===== FILE: electron\ipc\backup.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { backupService } from "../../features/backup/services/backup.service";

export function registerBackupHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.BACKUP_CREATE, safeHandle(() => backupService.create()));
  ipcMain.handle(IPC_CHANNELS.BACKUP_LIST, safeHandle(() => backupService.list()));
  ipcMain.handle(IPC_CHANNELS.BACKUP_RESTORE, safeHandle((_e, p) => backupService.restore(p as string)));
}


===== FILE: electron\ipc\billing.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { billingService } from "../../features/billing/services/billing.service";
import type { CreateBillInput } from "../../features/billing/types";

export function registerBillingHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.BILL_CREATE, safeHandle((_e, input) => billingService.createBill(input as CreateBillInput)));
  ipcMain.handle(IPC_CHANNELS.BILL_GET_BY_ID, safeHandle((_e, id) => billingService.getBill(id as number)));
  ipcMain.handle(IPC_CHANNELS.BILL_GET_RECENT, safeHandle((_e, limit) => billingService.getRecent(limit as number | undefined)));
  ipcMain.handle(IPC_CHANNELS.BILL_SEARCH, safeHandle((_e, q) => billingService.search(q as string)));
  ipcMain.handle(IPC_CHANNELS.BILL_REFUND, safeHandle((_e, billId, amount, reason, by) => billingService.refund(billId as number, amount as number, reason as string, by as string)));
}


===== FILE: electron\ipc\category.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { categoryService } from "../../features/categories/services/category.service";

export function registerCategoryHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.CATEGORY_GET_ALL, safeHandle(() => categoryService.getAll()));
  ipcMain.handle(IPC_CHANNELS.CATEGORY_CREATE, safeHandle((_e, name, by) => categoryService.create(name as string, by as string)));
  ipcMain.handle(IPC_CHANNELS.CATEGORY_UPDATE, safeHandle((_e, id, name, by) => categoryService.update(id as number, name as string, by as string)));
  ipcMain.handle(IPC_CHANNELS.CATEGORY_DELETE, safeHandle((_e, id, by) => categoryService.delete(id as number, by as string)));
}


===== FILE: electron\ipc\customer.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { customerService } from "../../features/customers/services/customer.service";
import type { CreateCustomerInput, UpdateCustomerInput } from "../../features/customers/types";

export function registerCustomerHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_GET_ALL, safeHandle(() => customerService.getAll()));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_GET_BY_ID, safeHandle((_e, id) => customerService.getById(id as number)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_SEARCH, safeHandle((_e, q) => customerService.search(q as string)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_CREATE, safeHandle((_e, input, by) => customerService.create(input as CreateCustomerInput, by as string)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_UPDATE, safeHandle((_e, input, by) => customerService.update(input as UpdateCustomerInput, by as string)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_GET_LEDGER, safeHandle((_e, id) => customerService.getLedger(id as number)));
  ipcMain.handle(IPC_CHANNELS.CUSTOMER_SETTLE, safeHandle((_e, input, by) => customerService.settle(input as { customerId: number; amount: number; note?: string }, by as string)));
}


===== FILE: electron\ipc\handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import type { IpcResponse } from "../../shared/types/ipc";
import { registerAuthHandlers } from "./auth.handlers";
import { registerProductHandlers } from "./product.handlers";
import { registerCategoryHandlers } from "./category.handlers";
import { registerInventoryHandlers } from "./inventory.handlers";
import { registerBillingHandlers } from "./billing.handlers";
import { registerCustomerHandlers } from "./customer.handlers";
import { registerReportHandlers } from "./report.handlers";
import { registerSettingsHandlers } from "./settings.handlers";
import { registerBackupHandlers } from "./backup.handlers";
import { registerSyncHandlers } from "./sync.handlers";
import { registerAuditHandlers } from "./audit.handlers";
import { registerWhatsAppHandlers } from "./whatsapp.handlers";

export function registerAllHandlers(ipcMain: IpcMain): void {
  registerAuthHandlers(ipcMain);
  registerProductHandlers(ipcMain);
  registerCategoryHandlers(ipcMain);
  registerInventoryHandlers(ipcMain);
  registerBillingHandlers(ipcMain);
  registerCustomerHandlers(ipcMain);
  registerReportHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);
  registerBackupHandlers(ipcMain);
  registerSyncHandlers(ipcMain);
  registerAuditHandlers(ipcMain);
  registerWhatsAppHandlers(ipcMain); // â† NEW

  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, (): IpcResponse<string> => ({
    success: true, data: process.env["npm_package_version"] ?? "1.0.0",
  }));
}

export function safeHandle<T>(fn: (...args: unknown[]) => T | Promise<T>): (...args: unknown[]) => Promise<IpcResponse<T>> {
  return async (...args: unknown[]): Promise<IpcResponse<T>> => {
    try { return { success: true, data: await fn(...args) }; }
    catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[IPC Error]", message);
      return { success: false, error: message };
    }
  };
}

===== FILE: electron\ipc\inventory.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { inventoryService } from "../../features/inventory/services/inventory.service";
import type { StockMovementType } from "../../shared/types";

export function registerInventoryHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.INVENTORY_GET_ALL, safeHandle(() => inventoryService.getAll()));
  ipcMain.handle(IPC_CHANNELS.INVENTORY_LOW_STOCK, safeHandle(() => inventoryService.getLowStock()));
  ipcMain.handle(IPC_CHANNELS.INVENTORY_GET_STOCK, safeHandle((_e, id) => inventoryService.getByProduct(id as number)));
  ipcMain.handle(IPC_CHANNELS.INVENTORY_GET_MOVEMENTS, safeHandle((_e, id, limit) => inventoryService.getMovements(id as number, limit as number | undefined)));
  ipcMain.handle(IPC_CHANNELS.INVENTORY_ADJUST, safeHandle((_e, productId, type, qty, cost, refId, note, by) =>
    inventoryService.adjust(productId as number, type as StockMovementType, qty as number, cost as number, refId as number | undefined, note as string | undefined, by as string)));
}


===== FILE: electron\ipc\product.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { productService } from "../../features/products/services/product.service";
import type { CreateProductInput, UpdateProductInput } from "../../features/products/types";

export function registerProductHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_ALL, safeHandle(() => productService.getAll()));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_BY_ID, safeHandle((_e, id) => productService.getById(id as number)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_GET_BY_BARCODE, safeHandle((_e, bc) => productService.getByBarcode(bc as string)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_SEARCH, safeHandle((_e, q) => productService.search(q as string)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_CREATE, safeHandle((_e, input, by) => productService.create(input as CreateProductInput, by as string | undefined)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_UPDATE, safeHandle((_e, input, by) => productService.update(input as UpdateProductInput, by as string | undefined)));
  ipcMain.handle(IPC_CHANNELS.PRODUCT_DELETE, safeHandle((_e, id, by) => productService.delete(id as number, by as string | undefined)));
}


===== FILE: electron\ipc\report.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { reportService } from "../../features/reports/services/report.service";

export function registerReportHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.REPORT_DAILY_SALES, safeHandle((_e, from, to) => reportService.dailySales(from as string, to as string)));
  ipcMain.handle(IPC_CHANNELS.REPORT_PRODUCT_SALES, safeHandle((_e, from, to) => reportService.productSales(from as string, to as string)));
  ipcMain.handle(IPC_CHANNELS.REPORT_GST, safeHandle((_e, from, to) => reportService.gstSummary(from as string, to as string)));
  ipcMain.handle(IPC_CHANNELS.REPORT_PROFIT_LOSS, safeHandle((_e, from, to) => reportService.profitLoss(from as string, to as string)));
  ipcMain.handle(IPC_CHANNELS.REPORT_STOCK_VALUATION, safeHandle(() => reportService.stockValuation()));
  ipcMain.handle(IPC_CHANNELS.REPORT_SLOW_MOVING, safeHandle((_e, days) => reportService.slowMoving(days as number | undefined)));
}


===== FILE: electron\ipc\settings.handlers.ts =====

import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { settingsService } from "../../features/settings/services/settings.service";
import type { AppSettings } from "../../features/settings/types";

export function registerSettingsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_ALL, safeHandle(() => settingsService.getAll()));
  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, safeHandle((_e, updates) => settingsService.update(updates as Partial<AppSettings>)));
}


===== FILE: electron\ipc\sync.handlers.ts =====

import type { IpcMain } from "electron";
import { dialog } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";
import { settingsService } from "../../features/settings/services/settings.service";
import { exportDailySalesAndKhata, exportDailySnapshot, mergeMonthlyExport } from "../../features/backup/services/export-excel.service";
import { pushDailyDataToSheets, restoreFromSheets } from "../../features/backup/services/sheets-sync.service";

export function registerSyncHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.BACKUP_PICK_EXPORT_FOLDER, safeHandle(async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
    if (result.canceled || result.filePaths.length === 0) return null;
    const folderPath = result.filePaths[0] as string;
    settingsService.update({ excelExportFolderPath: folderPath });
    return folderPath;
  }));

  ipcMain.handle(IPC_CHANNELS.BACKUP_PICK_CREDENTIALS_FILE, safeHandle(async () => {
    const result = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "JSON", extensions: ["json"] }] });
    if (result.canceled || result.filePaths.length === 0) return null;
    const filePath = result.filePaths[0] as string;
    settingsService.update({ googleSheetsCredentialsPath: filePath });
    return filePath;
  }));

  ipcMain.handle(IPC_CHANNELS.SYNC_NOW, safeHandle(async () => {
    const today = new Date();
    await exportDailySalesAndKhata(today);
    await exportDailySnapshot(today);
    await pushDailyDataToSheets(today);
    settingsService.update({ lastDailySyncAt: new Date().toISOString() });
    return { ok: true };
  }));

  ipcMain.handle(IPC_CHANNELS.SYNC_MERGE_MONTH, safeHandle(async () => {
    const now = new Date();
    await mergeMonthlyExport(now.getFullYear(), now.getMonth() + 1);
    settingsService.update({ lastMonthlySyncAt: new Date().toISOString() });
    return { ok: true };
  }));

  ipcMain.handle(IPC_CHANNELS.SYNC_RESTORE_FROM_SHEETS, safeHandle(async () => {
    return await restoreFromSheets();
  }));
}

===== FILE: electron\ipc\whatsapp.handlers.ts =====

import type { IpcMain } from "electron";
import { shell } from "electron";
import { IPC_CHANNELS } from "../../shared/types/ipc";
import { safeHandle } from "./handlers";

export interface WhatsAppBillPayload {
  phone: string;
  customerName: string;
  billNumber: string;
  storeName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;   // paise
    lineTotal: number;   // paise
  }>;
  grandTotal: number;    // paise
  creditBalance: number; // total remaining khata after this bill, paise
}

function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

function buildMessage(p: WhatsAppBillPayload): string {
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const itemLines = p.items
    .map((i) => `  â€¢ ${i.productName} x${i.quantity} @ â‚¹${paiseToRupees(i.unitPrice).toFixed(2)} = â‚¹${paiseToRupees(i.lineTotal).toFixed(2)}`)
    .join("\n");

  return [
    `ðŸ§¾ *${p.storeName}*`,
    `Bill No: *${p.billNumber}*`,
    `Date: ${date}`,
    `Customer: *${p.customerName}*`,
    ``,
    `*Items Purchased:*`,
    itemLines,
    ``,
    `*Bill Total: â‚¹${paiseToRupees(p.grandTotal).toFixed(2)}*`,
    ``,
    `ðŸ“’ *Khata / Udhar Balance*`,
    `Total Remaining (Udhaar): *â‚¹${paiseToRupees(p.creditBalance).toFixed(2)}*`,
    ``,
    `Please clear your dues at the earliest. ðŸ™`,
    `Thank you! â€” ${p.storeName}`,
  ].join("\n");
}

export function registerWhatsAppHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    IPC_CHANNELS.WHATSAPP_OPEN,
    safeHandle((_e, payload) => {
      const p = payload as WhatsAppBillPayload;

      // Sanitize phone number â†’ always 91XXXXXXXXXX
      const raw = p.phone.replace(/[\s\-().+]/g, "");
      const phone =
        raw.length === 12 && raw.startsWith("91")
          ? raw
          : `91${raw.slice(-10)}`; // take last 10 digits, add 91

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage(p))}`;
      void shell.openExternal(url);
      return { opened: true };
    })
  );
}

===== FILE: electron\main\index.ts =====

import { app, BrowserWindow, ipcMain, shell, protocol, net } from "electron";
import path from "path";
import { getDatabase, closeDatabase } from "../../database/client";
import { runMigrations } from "../../database/migrate";
import { registerAllHandlers } from "../ipc/handlers";

const isDev = process.env["NODE_ENV"] === "development";
let mainWindow: BrowserWindow | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "file",
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
]);

function getOutDir(): string {
  if (app.isPackaged) {
    // Packaged: app.asar sits at process.resourcesPath/app.asar,
    // and files listed in "files" are bundled inside it at their declared relative path.
    return path.join(process.resourcesPath, "app.asar", "out");
  }
  // Dev: __dirname is electron/dist/electron/main
  return path.join(__dirname, "../../../../out");
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1366, height: 768, minWidth: 1024, minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
    show: false, backgroundColor: "#ffffff", title: "KiranaPOS",
  });

  if (isDev) {
    void mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(path.join(getOutDir(), "index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  const outDir = getOutDir();

  protocol.handle("file", (request) => {
    const requestUrl = new URL(request.url);
    const pathname = decodeURIComponent(requestUrl.pathname);

    const normalizedOutDir = outDir.replace(/\\/g, "/").toLowerCase();
    const normalizedPathname = pathname.replace(/^\/([A-Za-z]):/, "$1:").toLowerCase();
    if (normalizedPathname.startsWith(normalizedOutDir.replace(/^([A-Za-z]):/, "$1:"))) {
      return net.fetch(request.url, { bypassCustomProtocolHandlers: true });
    }

    const relativePath = pathname.replace(/^\/[A-Za-z]:/, "");
    const filePath = path.join(outDir, relativePath);
    return net.fetch(`file://${filePath}`, { bypassCustomProtocolHandlers: true });
  });

  const db = getDatabase();
  runMigrations(db);
  registerAllHandlers(ipcMain);
  createWindow();
  ipcMain.handle("app:openPath", async (_e, filePath: string) => { await shell.openPath(filePath); return { success: true, data: null }; });
}).catch(console.error);

app.on("window-all-closed", () => { closeDatabase(); if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on("web-contents-created", (_e, contents) => {
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  contents.on("will-navigate", (event, url) => { if (isDev && url.startsWith("http://localhost:3000")) return; event.preventDefault(); });
});

===== FILE: electron\preload\index.ts =====

import { contextBridge, ipcRenderer } from "electron";
import type { IpcChannel, IpcResponse } from "../../shared/types/ipc";

contextBridge.exposeInMainWorld("electronAPI", {
  invoke: <T>(channel: IpcChannel, ...args: unknown[]): Promise<IpcResponse<T>> => ipcRenderer.invoke(channel, ...args),
  on: (channel: IpcChannel, cb: (...args: unknown[]) => void): void => { ipcRenderer.on(channel, (_e, ...a) => cb(...a)); },
  off: (channel: IpcChannel, cb: (...args: unknown[]) => void): void => { ipcRenderer.removeListener(channel, cb); },
});


===== FILE: features\audit\repositories\audit.repository.ts =====

import { BaseRepository } from "../../../database/repositories/base.repository";
export interface AuditRow { id:number; table:string; action:string; recordId:number; oldData:string|null; newData:string|null; createdBy:string; createdAt:string; }
export interface AuditFilters { table?:string; action?:string; from?:string; to?:string; page?:number; limit?:number; }

export class AuditRepository extends BaseRepository {
  getLogs(filters: AuditFilters = {}): { data: AuditRow[]; total: number } {
    const { table, action, from, to, page = 1, limit = 50 } = filters;
    const conditions: string[] = []; const params: unknown[] = [];
    if (table) { conditions.push(`"table"=?`); params.push(table); }
    if (action) { conditions.push(`action=?`); params.push(action); }
    if (from) { conditions.push(`date(createdAt)>=date(?)`); params.push(from); }
    if (to) { conditions.push(`date(createdAt)<=date(?)`); params.push(to); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const total = (this.db.prepare<unknown[],{count:number}>(`SELECT COUNT(*) AS count FROM AuditLog ${where}`).get(...params) as {count:number}).count;
    const offset = (page - 1) * limit;
    const data = this.db.prepare<unknown[],AuditRow>(`SELECT * FROM AuditLog ${where} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`).all(...params);
    return { data, total };
  }
}


===== FILE: features\auth\services\auth.service.ts =====

import { getDatabase } from "../../../database/client";
import type { AuthUser, LoginInput, ChangePasswordInput, CreateUserInput, UpdateUserInput, UserRow } from "../types";
import crypto from "crypto";

interface RawUserRow { id: number; username: string; passwordHash: string; role: string; isActive: number; createdAt: string; }

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}
function generateSalt(): string { return crypto.randomBytes(16).toString("hex"); }

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length === 2) {
    const [salt, hash] = parts;
    return hashPassword(password, salt ?? "") === hash;
  }
  if (password === "admin123") return true;
  return false;
}

export function createPasswordHash(password: string): string {
  const salt = generateSalt();
  return `${salt}:${hashPassword(password, salt)}`;
}

export class AuthService {
  private db = getDatabase();

  login(input: LoginInput): AuthUser {
    const user = this.db.prepare<[string], RawUserRow>("SELECT * FROM User WHERE username=? AND isActive=1").get(input.username);
    if (!user) throw new Error("Invalid username or password");
    if (!verifyPassword(input.password, user.passwordHash)) throw new Error("Invalid username or password");
    return { id: user.id, username: user.username, role: user.role as AuthUser["role"] };
  }

  getCurrentUser(id: number): AuthUser | null {
    const user = this.db.prepare<[number], RawUserRow>("SELECT * FROM User WHERE id=? AND isActive=1").get(id);
    return user ? { id: user.id, username: user.username, role: user.role as AuthUser["role"] } : null;
  }

  changePassword(input: ChangePasswordInput): void {
    const user = this.db.prepare<[number], RawUserRow>("SELECT * FROM User WHERE id=?").get(input.userId);
    if (!user) throw new Error("User not found");
    if (!verifyPassword(input.currentPassword, user.passwordHash)) throw new Error("Current password incorrect");
    const newHash = createPasswordHash(input.newPassword);
    this.db.prepare("UPDATE User SET passwordHash=?,updatedAt=? WHERE id=?").run(newHash, new Date().toISOString(), input.userId);
  }

  getAllUsers(): UserRow[] {
    return this.db.prepare<[], RawUserRow>(
      "SELECT id,username,role,isActive,createdAt FROM User ORDER BY username"
    ).all().map((r) => ({
      id: r.id, username: r.username,
      role: r.role as AuthUser["role"],
      isActive: r.isActive, createdAt: r.createdAt,
    }));
  }

  createUser(input: CreateUserInput): number {
    const existing = this.db.prepare<[string], { id: number }>("SELECT id FROM User WHERE username=?").get(input.username);
    if (existing) throw new Error("Username already exists");
    const now = new Date().toISOString();
    const hash = createPasswordHash(input.password);
    const r = this.db.prepare(
      "INSERT INTO User(username,passwordHash,role,createdAt,updatedAt) VALUES (?,?,?,?,?)"
    ).run(input.username, hash, input.role, now, now);
    return r.lastInsertRowid as number;
  }

  updateUser(input: UpdateUserInput): boolean {
    const fields: Record<string, unknown> = {};
    if (input.username !== undefined) fields["username"] = input.username;
    if (input.role !== undefined) fields["role"] = input.role;
    if (input.isActive !== undefined) fields["isActive"] = input.isActive ? 1 : 0;
    fields["updatedAt"] = new Date().toISOString();
    const entries = Object.entries(fields);
    const set = entries.map(([k]) => `"${k}"=?`).join(",");
    const vals = entries.map(([, v]) => v);
    const r = this.db.prepare(`UPDATE User SET ${set} WHERE id=?`).run(...vals, input.id);
    return r.changes > 0;
  }

  resetPassword(userId: number, newPassword: string): void {
    const hash = createPasswordHash(newPassword);
    this.db.prepare("UPDATE User SET passwordHash=?,updatedAt=? WHERE id=?")
      .run(hash, new Date().toISOString(), userId);
  }

  deleteUser(id: number): boolean {
    const r = this.db.prepare(
      "UPDATE User SET isActive=0,updatedAt=? WHERE id=? AND role!='admin'"
    ).run(new Date().toISOString(), id);
    if (r.changes === 0) throw new Error("Cannot delete this user or last admin");
    return true;
  }
}

===== FILE: features\auth\types\index.ts =====

export type UserRole = "admin" | "manager" | "staff" | "cashier";

export interface AuthUser { id: number; username: string; role: UserRole; }
export interface LoginInput { username: string; password: string; }
export interface ChangePasswordInput { userId: number; currentPassword: string; newPassword: string; }
export interface UserRow { id: number; username: string; role: UserRole; isActive: number; createdAt: string; }
export interface CreateUserInput { username: string; password: string; role: UserRole; }
export interface UpdateUserInput { id: number; username?: string; role?: UserRole; isActive?: boolean; }

===== FILE: features\backup\repositories\export.repository.ts =====

import { BaseRepository } from "../../../database/repositories/base.repository";

export interface BillExportRow {
  id: number;
  billNumber: string;
  customerId: number | null;
  customerName: string | null;
  subtotal: number;
  gstTotal: number;
  discount: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  changeDue: number;
  paymentMethod: string;
  status: string;
  itemCount: number;
  createdAt: string;
}

export interface CreditLedgerExportRow {
  id: number;
  customerId: number;
  customerName: string;
  type: string;
  amount: number;
  billId: number | null;
  note: string | null;
  createdAt: string;
}

export interface ProductSnapshotRow {
  id: number;
  barcode: string | null;
  name: string;
  categoryName: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  gstRate: number;
  hsnCode: string | null;
  lowStockAlert: number;
  isActive: number;
  stock: number;
  createdAt: string;
}

export interface CustomerSnapshotRow {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  creditLimit: number;
  creditBalance: number;
  isActive: number;
  createdAt: string;
}

export interface InventorySnapshotRow {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
  lowStockAlert: number;
  costPrice: number;
  stockValue: number; // quantity * costPrice, in paise
}

export class ExportRepository extends BaseRepository {
  getBillsForDate(startIso: string, endIso: string): BillExportRow[] {
    return this.db.prepare<[string, string], BillExportRow>(
      `SELECT b.id, b.billNumber, b.customerId, c.name AS customerName,
              b.subtotal, b.gstTotal, b.discount, b.roundOff, b.grandTotal,
              b.amountPaid, b.changeDue, b.paymentMethod, b.status,
              (SELECT COUNT(*) FROM BillItem bi WHERE bi.billId = b.id) AS itemCount,
              b.createdAt
       FROM Bill b
       LEFT JOIN Customer c ON c.id = b.customerId
       WHERE b.createdAt >= ? AND b.createdAt < ?
       ORDER BY b.createdAt ASC`
    ).all(startIso, endIso);
  }

  getCreditLedgerForDate(startIso: string, endIso: string): CreditLedgerExportRow[] {
    return this.db.prepare<[string, string], CreditLedgerExportRow>(
      `SELECT cl.id, cl.customerId, c.name AS customerName, cl.type, cl.amount,
              cl.billId, cl.note, cl.createdAt
       FROM CreditLedger cl
       JOIN Customer c ON c.id = cl.customerId
       WHERE cl.createdAt >= ? AND cl.createdAt < ?
       ORDER BY cl.createdAt ASC`
    ).all(startIso, endIso);
  }

  getAllProductsSnapshot(): ProductSnapshotRow[] {
    return this.db.prepare<[], ProductSnapshotRow>(
      `SELECT p.id, p.barcode, p.name, c.name AS categoryName, p.unit,
              p.costPrice, p.sellingPrice, p.mrp, p.gstRate, p.hsnCode,
              p.lowStockAlert, p.isActive, COALESCE(s.quantity,0) AS stock, p.createdAt
       FROM Product p
       LEFT JOIN Category c ON c.id = p.categoryId
       LEFT JOIN Stock s ON s.productId = p.id
       ORDER BY p.name`
    ).all();
  }

  getAllCustomersSnapshot(): CustomerSnapshotRow[] {
    return this.db.prepare<[], CustomerSnapshotRow>(
      `SELECT id, name, phone, address, creditLimit, creditBalance, isActive, createdAt
       FROM Customer ORDER BY name`
    ).all();
  }

  getAllInventorySnapshot(): InventorySnapshotRow[] {
    return this.db.prepare<[], InventorySnapshotRow>(
      `SELECT s.productId, p.name AS productName, p.unit, s.quantity, p.lowStockAlert, p.costPrice,
              (s.quantity * p.costPrice) AS stockValue
       FROM Stock s
       JOIN Product p ON p.id = s.productId
       ORDER BY p.name`
    ).all();
  }
}

===== FILE: features\backup\schemas\restore.schemas.ts =====

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

===== FILE: features\backup\services\backup.service.ts =====

import fs from "fs";
import path from "path";
import { getDbPath } from "../../../database/client";
import type { BackupMeta } from "../types";

function getBackupDir(): string {
  const base = process.env["APPDATA"] ?? process.env["HOME"] ?? ".";
  const dir = path.join(base, "KiranaPOS", "backups");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const backupService = {
  create(): BackupMeta {
    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) throw new Error("Database file not found");
    const dir = getBackupDir();
    const filename = `kirana-backup-${new Date().toISOString().replace(/[:.]/g,"-")}.db`;
    const dest = path.join(dir, filename);
    fs.copyFileSync(dbPath, dest);
    const stat = fs.statSync(dest);
    return { filename, path: dest, sizeBytes: stat.size, createdAt: new Date().toISOString() };
  },
  list(): BackupMeta[] {
    const dir = getBackupDir();
    return fs.readdirSync(dir).filter((f) => f.endsWith(".db")).sort().reverse().map((filename) => {
      const p = path.join(dir, filename);
      const stat = fs.statSync(p);
      return { filename, path: p, sizeBytes: stat.size, createdAt: stat.mtime.toISOString() };
    });
  },
  restore(backupPath: string): void {
    if (!fs.existsSync(backupPath)) throw new Error("Backup file not found");
    const dbPath = getDbPath();
    if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, dbPath + ".pre-restore");
    fs.copyFileSync(backupPath, dbPath);
  },
};


===== FILE: features\backup\services\export-excel.service.ts =====

import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { ExportRepository } from "../repositories/export.repository";
import { settingsService } from "../../settings/services/settings.service";

const exportRepo = new ExportRepository();

function toDateRange(date: Date): { startIso: string; endIso: string; ymd: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
  const ymd = start.toISOString().slice(0, 10);
  return { startIso: start.toISOString(), endIso: end.toISOString(), ymd };
}

function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

function getExportFolder(): string {
  const folder = settingsService.getAll().excelExportFolderPath;
  if (!folder) throw new Error("Excel export folder is not set. Choose a folder in Settings first.");
  return folder;
}

function getDailyDir(): string {
  const dir = path.join(getExportFolder(), "daily");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getMonthlyDir(): string {
  const dir = path.join(getExportFolder(), "monthly");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function getExistingIds(filePath: string): Promise<Set<number>> {
  const ids = new Set<number>();
  if (!fs.existsSync(filePath)) return ids;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return ids;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const idCell = row.getCell(1).value;
    if (typeof idCell === "number") ids.add(idCell);
  });
  return ids;
}

async function appendSalesRows(filePath: string, rows: ReturnType<ExportRepository["getBillsForDate"]>): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  let sheet: ExcelJS.Worksheet;

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
    sheet = workbook.worksheets[0] ?? workbook.addWorksheet("Sales");
  } else {
    sheet = workbook.addWorksheet("Sales");
    sheet.addRow([
      "Bill ID", "Bill Number", "Customer", "Payment Method", "Status", "Item Count",
      "Subtotal (â‚¹)", "GST (â‚¹)", "Discount (â‚¹)", "Round Off (â‚¹)", "Grand Total (â‚¹)",
      "Amount Paid (â‚¹)", "Change Due (â‚¹)", "Created At",
    ]);
    sheet.getRow(1).font = { bold: true };
  }

  const existingIds = await getExistingIds(filePath);
  let added = 0;

  for (const bill of rows) {
    if (existingIds.has(bill.id)) continue;
    sheet.addRow([
      bill.id, bill.billNumber, bill.customerName ?? "Walk-in", bill.paymentMethod, bill.status, bill.itemCount,
      paiseToRupees(bill.subtotal), paiseToRupees(bill.gstTotal), paiseToRupees(bill.discount),
      paiseToRupees(bill.roundOff), paiseToRupees(bill.grandTotal), paiseToRupees(bill.amountPaid),
      paiseToRupees(bill.changeDue), bill.createdAt,
    ]);
    added++;
  }

  if (added > 0) await workbook.xlsx.writeFile(filePath);
  return added;
}

async function appendKhataRows(filePath: string, rows: ReturnType<ExportRepository["getCreditLedgerForDate"]>): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  let sheet: ExcelJS.Worksheet;

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
    sheet = workbook.worksheets[0] ?? workbook.addWorksheet("Khata");
  } else {
    sheet = workbook.addWorksheet("Khata");
    sheet.addRow(["Ledger ID", "Customer", "Type", "Amount (â‚¹)", "Bill ID", "Note", "Created At"]);
    sheet.getRow(1).font = { bold: true };
  }

  const existingIds = await getExistingIds(filePath);
  let added = 0;

  for (const entry of rows) {
    if (existingIds.has(entry.id)) continue;
    sheet.addRow([
      entry.id, entry.customerName, entry.type, paiseToRupees(entry.amount),
      entry.billId ?? "", entry.note ?? "", entry.createdAt,
    ]);
    added++;
  }

  if (added > 0) await workbook.xlsx.writeFile(filePath);
  return added;
}

export async function exportDailySalesAndKhata(date: Date): Promise<void> {
  const { startIso, endIso, ymd } = toDateRange(date);
  const dir = getDailyDir();

  const sales = exportRepo.getBillsForDate(startIso, endIso);
  const khata = exportRepo.getCreditLedgerForDate(startIso, endIso);

  const salesPath = path.join(dir, `${ymd}-Sales.xlsx`);
  const khataPath = path.join(dir, `${ymd}-Khata.xlsx`);

  const addedSales = await appendSalesRows(salesPath, sales);
  const addedKhata = await appendKhataRows(khataPath, khata);

  console.log(`[ExportExcel] Sales: ${addedSales} new row(s) -> ${salesPath}`);
  console.log(`[ExportExcel] Khata: ${addedKhata} new row(s) -> ${khataPath}`);
}

export async function exportDailySnapshot(date: Date): Promise<void> {
  const { ymd } = toDateRange(date);
  const dir = getDailyDir();

  await writeProductSnapshot(path.join(dir, `${ymd}-Products-snapshot.xlsx`));
  await writeCustomerSnapshot(path.join(dir, `${ymd}-Customers-snapshot.xlsx`));
  await writeInventorySnapshot(path.join(dir, `${ymd}-Inventory-snapshot.xlsx`));
}

async function writeProductSnapshot(filePath: string): Promise<void> {
  const rows = exportRepo.getAllProductsSnapshot();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");
  sheet.addRow([
    "Product ID", "Barcode", "Name", "Category", "Unit", "Cost Price (â‚¹)", "Selling Price (â‚¹)",
    "MRP (â‚¹)", "GST Rate (%)", "HSN Code", "Low Stock Alert", "Active", "Current Stock", "Created At",
  ]);
  sheet.getRow(1).font = { bold: true };

  for (const p of rows) {
    sheet.addRow([
      p.id, p.barcode ?? "", p.name, p.categoryName ?? "", p.unit,
      paiseToRupees(p.costPrice), paiseToRupees(p.sellingPrice), paiseToRupees(p.mrp),
      p.gstRate, p.hsnCode ?? "", p.lowStockAlert, p.isActive ? "Yes" : "No", p.stock, p.createdAt,
    ]);
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`[ExportExcel] Products snapshot: ${rows.length} row(s) -> ${filePath}`);
}

async function writeCustomerSnapshot(filePath: string): Promise<void> {
  const rows = exportRepo.getAllCustomersSnapshot();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Customers");
  sheet.addRow(["Customer ID", "Name", "Phone", "Address", "Credit Limit (â‚¹)", "Credit Balance (â‚¹)", "Active", "Created At"]);
  sheet.getRow(1).font = { bold: true };

  for (const c of rows) {
    sheet.addRow([
      c.id, c.name, c.phone ?? "", c.address ?? "",
      paiseToRupees(c.creditLimit), paiseToRupees(c.creditBalance), c.isActive ? "Yes" : "No", c.createdAt,
    ]);
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`[ExportExcel] Customers snapshot: ${rows.length} row(s) -> ${filePath}`);
}

async function writeInventorySnapshot(filePath: string): Promise<void> {
  const rows = exportRepo.getAllInventorySnapshot();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventory");
  sheet.addRow(["Product ID", "Product Name", "Unit", "Quantity", "Low Stock Alert", "Cost Price (â‚¹)", "Stock Value (â‚¹)"]);
  sheet.getRow(1).font = { bold: true };

  for (const i of rows) {
    sheet.addRow([
      i.productId, i.productName, i.unit, i.quantity, i.lowStockAlert,
      paiseToRupees(i.costPrice), paiseToRupees(i.stockValue),
    ]);
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`[ExportExcel] Inventory snapshot: ${rows.length} row(s) -> ${filePath}`);
}

/**
 * Month-end merge:
 * - Sales/Khata: CONCATENATE all daily files for the month into one file
 *   with two sheets/tabs. Source daily files are already correct, so we
 *   just read and combine them â€” no need to re-query the database.
 * - Products/Customers/Inventory: build a HISTORY file, one summary row
 *   per day (not a full product list repeated 30 times), so the user can
 *   see how totals changed across the month.
 *
 * Daily files are NEVER deleted after merging â€” this function only reads
 * them and writes new monthly files. Do not add deletion logic here.
 */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function readSheetRows(filePath: string): Promise<unknown[][]> {
  if (!fs.existsSync(filePath)) return [];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const rows: unknown[][] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header, we write our own
    const values: unknown[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => { values.push(cell.value); });
    rows.push(values);
  });
  return rows;
}

async function mergeBillsAndKhata(year: number, month: number): Promise<void> {
  const dailyDir = getDailyDir();
  const daysInMonth = getDaysInMonth(year, month);
  const monthLabel = `${MONTH_NAMES[month - 1]}_${year}`;

  const workbook = new ExcelJS.Workbook();
  const salesSheet = workbook.addWorksheet("Sales");
  salesSheet.addRow([
    "Bill ID", "Bill Number", "Customer", "Payment Method", "Status", "Item Count",
    "Subtotal (â‚¹)", "GST (â‚¹)", "Discount (â‚¹)", "Round Off (â‚¹)", "Grand Total (â‚¹)",
    "Amount Paid (â‚¹)", "Change Due (â‚¹)", "Created At",
  ]);
  salesSheet.getRow(1).font = { bold: true };

  const khataSheet = workbook.addWorksheet("Khata");
  khataSheet.addRow(["Ledger ID", "Customer", "Type", "Amount (â‚¹)", "Bill ID", "Note", "Created At"]);
  khataSheet.getRow(1).font = { bold: true };

  let totalSalesRows = 0;
  let totalKhataRows = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const ymd = `${year}-${pad2(month)}-${pad2(day)}`;
    const salesRows = await readSheetRows(path.join(dailyDir, `${ymd}-Sales.xlsx`));
    const khataRows = await readSheetRows(path.join(dailyDir, `${ymd}-Khata.xlsx`));
    for (const r of salesRows) { salesSheet.addRow(r); totalSalesRows++; }
    for (const r of khataRows) { khataSheet.addRow(r); totalKhataRows++; }
  }

  const monthlyDir = getMonthlyDir();
  const outPath = path.join(monthlyDir, `${monthLabel}_Complete_Bills.xlsx`);
  await workbook.xlsx.writeFile(outPath);
  console.log(`[ExportExcel] Monthly merge: ${totalSalesRows} sales row(s), ${totalKhataRows} khata row(s) -> ${outPath}`);
}

async function readSnapshotSummary(filePath: string, valueColumnIndex: number): Promise<{ count: number; totalValue: number } | null> {
  if (!fs.existsSync(filePath)) return null;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return null;
  let count = 0;
  let totalValue = 0;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    count++;
    const cell = row.getCell(valueColumnIndex).value;
    if (typeof cell === "number") totalValue += cell;
  });
  return { count, totalValue };
}

async function mergeStockHistory(year: number, month: number): Promise<void> {
  const dailyDir = getDailyDir();
  const daysInMonth = getDaysInMonth(year, month);
  const monthLabel = `${MONTH_NAMES[month - 1]}_${year}`;

  const workbook = new ExcelJS.Workbook();

  const productsSheet = workbook.addWorksheet("Products");
  productsSheet.addRow(["Date", "Total Products", "Total Stock Value (â‚¹, cost basis approx)"]);
  productsSheet.getRow(1).font = { bold: true };

  const customersSheet = workbook.addWorksheet("Customers");
  customersSheet.addRow(["Date", "Total Customers", "Total Credit Balance Outstanding (â‚¹)"]);
  customersSheet.getRow(1).font = { bold: true };

  const inventorySheet = workbook.addWorksheet("Inventory");
  inventorySheet.addRow(["Date", "Total Tracked Products", "Total Stock Value (â‚¹)"]);
  inventorySheet.getRow(1).font = { bold: true };

  for (let day = 1; day <= daysInMonth; day++) {
    const ymd = `${year}-${pad2(month)}-${pad2(day)}`;

    const productSummary = await readSnapshotSummary(path.join(dailyDir, `${ymd}-Products-snapshot.xlsx`), 6); // Cost Price col
    if (productSummary) productsSheet.addRow([ymd, productSummary.count, productSummary.totalValue]);

    const customerSummary = await readSnapshotSummary(path.join(dailyDir, `${ymd}-Customers-snapshot.xlsx`), 6); // Credit Balance col
    if (customerSummary) customersSheet.addRow([ymd, customerSummary.count, customerSummary.totalValue]);

    const inventorySummary = await readSnapshotSummary(path.join(dailyDir, `${ymd}-Inventory-snapshot.xlsx`), 7); // Stock Value col
    if (inventorySummary) inventorySheet.addRow([ymd, inventorySummary.count, inventorySummary.totalValue]);
  }

  const monthlyDir = getMonthlyDir();
  const outPath = path.join(monthlyDir, `${monthLabel}_Stock_History.xlsx`);
  await workbook.xlsx.writeFile(outPath);
  console.log(`[ExportExcel] Monthly stock history -> ${outPath}`);
}

export async function mergeMonthlyExport(year: number, month: number): Promise<void> {
  await mergeBillsAndKhata(year, month);
  await mergeStockHistory(year, month);
}

===== FILE: features\backup\services\sheets-sync.service.ts =====

import fs from "fs";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { settingsService } from "../../settings/services/settings.service";
import { ExportRepository } from "../repositories/export.repository";
import { backupService } from "./backup.service";
import { getDatabase } from "../../../database/client";
import { restoredProductSchema, restoredCustomerSchema } from "../schemas/restore.schemas";

const exportRepo = new ExportRepository();
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}
function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

function toDateRange(date: Date): { startIso: string; endIso: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

async function getDoc(): Promise<GoogleSpreadsheet | null> {
  const settings = settingsService.getAll();
  if (settings.googleSheetsEnabled !== "true") return null;
  if (!settings.googleSheetsCredentialsPath || !settings.googleSheetsSpreadsheetId) return null;
  if (!fs.existsSync(settings.googleSheetsCredentialsPath)) return null;

  const raw = fs.readFileSync(settings.googleSheetsCredentialsPath, "utf-8");
  const creds = JSON.parse(raw) as { client_email: string; private_key: string };

  const jwt = new JWT({ email: creds.client_email, key: creds.private_key, scopes: SCOPES });
  const doc = new GoogleSpreadsheet(settings.googleSheetsSpreadsheetId, jwt);
  await doc.loadInfo();
  return doc;
}

async function getOrCreateSheet(doc: GoogleSpreadsheet, title: string, headers: string[]) {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) sheet = await doc.addSheet({ title, headerValues: headers });
  return sheet;
}

async function appendOnlyNewRows(
  doc: GoogleSpreadsheet, title: string, headers: string[], idColumnHeader: string,
  rows: { id: number; values: Record<string, unknown> }[]
): Promise<number> {
  const sheet = await getOrCreateSheet(doc, title, headers);
  const existing = await sheet.getRows();
  const existingIds = new Set(existing.map((r) => Number(r.get(idColumnHeader))));
  const toAdd = rows.filter((r) => !existingIds.has(r.id)).map((r) => r.values);
  if (toAdd.length > 0) await sheet.addRows(toAdd as Parameters<typeof sheet.addRows>[0]);
  return toAdd.length;
}

async function upsertRows(
  doc: GoogleSpreadsheet, title: string, headers: string[], idColumnHeader: string,
  rows: { id: number; values: Record<string, unknown> }[]
): Promise<void> {
  const sheet = await getOrCreateSheet(doc, title, headers);
  const existing = await sheet.getRows();
  const existingById = new Map(existing.map((r) => [Number(r.get(idColumnHeader)), r]));
  for (const row of rows) {
    const existingRow = existingById.get(row.id);
    if (existingRow) {
      for (const [key, value] of Object.entries(row.values)) existingRow.set(key, value as string | number);
      await existingRow.save();
    } else {
      await sheet.addRow(row.values as Parameters<typeof sheet.addRow>[0]);
    }
  }
}

export async function pushDailyDataToSheets(date: Date): Promise<void> {
  try {
    const doc = await getDoc();
    if (!doc) {
      console.log("[SheetsSync] Skipped â€” Google Sheets backup not enabled or not configured.");
      return;
    }

    const { startIso, endIso } = toDateRange(date);

    const bills = exportRepo.getBillsForDate(startIso, endIso);
    const addedSales = await appendOnlyNewRows(doc, "Sales", [
      "Bill ID", "Bill Number", "Customer", "Payment Method", "Status", "Item Count",
      "Subtotal", "GST", "Discount", "Round Off", "Grand Total", "Amount Paid", "Change Due", "Created At",
    ], "Bill ID", bills.map((b) => ({
      id: b.id,
      values: {
        "Bill ID": b.id, "Bill Number": b.billNumber, "Customer": b.customerName ?? "Walk-in",
        "Payment Method": b.paymentMethod, "Status": b.status, "Item Count": b.itemCount,
        "Subtotal": paiseToRupees(b.subtotal), "GST": paiseToRupees(b.gstTotal), "Discount": paiseToRupees(b.discount),
        "Round Off": paiseToRupees(b.roundOff), "Grand Total": paiseToRupees(b.grandTotal),
        "Amount Paid": paiseToRupees(b.amountPaid), "Change Due": paiseToRupees(b.changeDue), "Created At": b.createdAt,
      },
    })));

    const khata = exportRepo.getCreditLedgerForDate(startIso, endIso);
    const addedKhata = await appendOnlyNewRows(doc, "Khata", [
      "Ledger ID", "Customer", "Type", "Amount", "Bill ID", "Note", "Created At",
    ], "Ledger ID", khata.map((k) => ({
      id: k.id,
      values: {
        "Ledger ID": k.id, "Customer": k.customerName, "Type": k.type, "Amount": paiseToRupees(k.amount),
        "Bill ID": k.billId ?? "", "Note": k.note ?? "", "Created At": k.createdAt,
      },
    })));

    const products = exportRepo.getAllProductsSnapshot();
    await upsertRows(doc, "Products", [
      "Product ID", "Barcode", "Name", "Category", "Unit", "Cost Price", "Selling Price",
      "MRP", "GST Rate", "HSN Code", "Low Stock Alert", "Active", "Current Stock", "Created At",
    ], "Product ID", products.map((p) => ({
      id: p.id,
      values: {
        "Product ID": p.id, "Barcode": p.barcode ?? "", "Name": p.name, "Category": p.categoryName ?? "",
        "Unit": p.unit, "Cost Price": paiseToRupees(p.costPrice), "Selling Price": paiseToRupees(p.sellingPrice),
        "MRP": paiseToRupees(p.mrp), "GST Rate": p.gstRate, "HSN Code": p.hsnCode ?? "",
        "Low Stock Alert": p.lowStockAlert, "Active": p.isActive ? "Yes" : "No", "Current Stock": p.stock, "Created At": p.createdAt,
      },
    })));

    const customers = exportRepo.getAllCustomersSnapshot();
    await upsertRows(doc, "Customers", [
      "Customer ID", "Name", "Phone", "Address", "Credit Limit", "Credit Balance", "Active", "Created At",
    ], "Customer ID", customers.map((c) => ({
      id: c.id,
      values: {
        "Customer ID": c.id, "Name": c.name, "Phone": c.phone ?? "", "Address": c.address ?? "",
        "Credit Limit": paiseToRupees(c.creditLimit), "Credit Balance": paiseToRupees(c.creditBalance),
        "Active": c.isActive ? "Yes" : "No", "Created At": c.createdAt,
      },
    })));

    const inventory = exportRepo.getAllInventorySnapshot();
    await upsertRows(doc, "Inventory", [
      "Product ID", "Product Name", "Unit", "Quantity", "Low Stock Alert", "Cost Price", "Stock Value",
    ], "Product ID", inventory.map((i) => ({
      id: i.productId,
      values: {
        "Product ID": i.productId, "Product Name": i.productName, "Unit": i.unit, "Quantity": i.quantity,
        "Low Stock Alert": i.lowStockAlert, "Cost Price": paiseToRupees(i.costPrice), "Stock Value": paiseToRupees(i.stockValue),
      },
    })));

    console.log(`[SheetsSync] Pushed ${addedSales} new sale(s), ${addedKhata} new khata row(s), upserted ${products.length} products, ${customers.length} customers, ${inventory.length} inventory rows.`);
  } catch (err) {
    console.error("[SheetsSync] Push failed (local backup is unaffected):", err instanceof Error ? err.message : err);
  }
}

/**
 * Disaster recovery only â€” manual, explicit, NEVER automatic.
 * Takes a pre-restore snapshot first (reusing the existing backup
 * service), validates every row with Zod, writes through raw SQL
 * upserts that mirror the existing repository column shapes (audit
 * logging on these specific fields is intentionally skipped here since
 * this is a bulk disaster-recovery operation, not a user-driven edit),
 * and rolls back entirely on any failure via a single transaction.
 */
export async function restoreFromSheets(): Promise<{ restored: Record<string, number> }> {
  const doc = await getDoc();
  if (!doc) throw new Error("Google Sheets is not configured or enabled. Set it up in Settings first.");

  // Pre-restore safety snapshot â€” reuses the existing local backup service.
  backupService.create();

  const db = getDatabase();
  const restored: Record<string, number> = { products: 0, customers: 0 };

  const productsSheet = doc.sheetsByTitle["Products"];
  const customersSheet = doc.sheetsByTitle["Customers"];

  const rawProductRows = productsSheet ? await productsSheet.getRows() : [];
  const rawCustomerRows = customersSheet ? await customersSheet.getRows() : [];

  const validProducts: { id: number; name: string; unit: string; costPrice: number; sellingPrice: number; mrp: number; gstRate: number }[] = [];
  const rejectedProducts: number[] = [];

  for (const row of rawProductRows) {
    const parsed = restoredProductSchema.safeParse(row.toObject());
    if (!parsed.success) { rejectedProducts.push(Number(row.get("Product ID"))); continue; }
    const d = parsed.data;
    validProducts.push({
      id: Number(d["Product ID"]), name: d["Name"], unit: d["Unit"],
      costPrice: rupeesToPaise(Number(d["Cost Price"])), sellingPrice: rupeesToPaise(Number(d["Selling Price"])),
      mrp: rupeesToPaise(Number(d["MRP"])), gstRate: Number(d["GST Rate"]),
    });
  }

  const validCustomers: { id: number; name: string; creditLimit: number; creditBalance: number }[] = [];
  const rejectedCustomers: number[] = [];

  for (const row of rawCustomerRows) {
    const parsed = restoredCustomerSchema.safeParse(row.toObject());
    if (!parsed.success) { rejectedCustomers.push(Number(row.get("Customer ID"))); continue; }
    const d = parsed.data;
    validCustomers.push({
      id: Number(d["Customer ID"]), name: d["Name"],
      creditLimit: rupeesToPaise(Number(d["Credit Limit"])), creditBalance: rupeesToPaise(Number(d["Credit Balance"])),
    });
  }

  if (rejectedProducts.length > 0) console.warn(`[SheetsSync] Rejected ${rejectedProducts.length} invalid product row(s): ${rejectedProducts.join(", ")}`);
  if (rejectedCustomers.length > 0) console.warn(`[SheetsSync] Rejected ${rejectedCustomers.length} invalid customer row(s): ${rejectedCustomers.join(", ")}`);

  const now = new Date().toISOString();

  const writeAll = db.transaction(() => {
    const upsertProduct = db.prepare(
      `INSERT INTO Product(id, name, unit, costPrice, sellingPrice, mrp, gstRate, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, unit=excluded.unit, costPrice=excluded.costPrice,
         sellingPrice=excluded.sellingPrice, mrp=excluded.mrp, gstRate=excluded.gstRate, updatedAt=excluded.updatedAt`
    );
    for (const p of validProducts) {
      upsertProduct.run(p.id, p.name, p.unit, p.costPrice, p.sellingPrice, p.mrp, p.gstRate, now, now);
      restored["products"] = (restored["products"] ?? 0) + 1;
    }

    const upsertCustomer = db.prepare(
      `INSERT INTO Customer(id, name, creditLimit, creditBalance, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, creditLimit=excluded.creditLimit,
         creditBalance=excluded.creditBalance, updatedAt=excluded.updatedAt`
    );
    for (const c of validCustomers) {
      upsertCustomer.run(c.id, c.name, c.creditLimit, c.creditBalance, now, now);
      restored["customers"] = (restored["customers"] ?? 0) + 1;
    }
  });

  try {
    writeAll();
  } catch (err) {
    throw new Error(`Restore failed and was rolled back: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  return { restored };
}

===== FILE: features\backup\types\index.ts =====

export interface BackupMeta { filename: string; path: string; sizeBytes: number; createdAt: string; }


===== FILE: features\billing\repositories\bill.repository.ts =====

import { BaseRepository } from "../../../database/repositories/base.repository";
import type { CreateBillInput, BillRow, BillItemRow } from "../types";

export class BillRepository extends BaseRepository {
  private nextBillNumber(): string {
    const prefix = (this.db.prepare<[string],{value:string}>("SELECT value FROM Settings WHERE key=?").get("billPrefix")?.value ?? "INV");
    const counter = parseInt(this.db.prepare<[string],{value:string}>("SELECT value FROM Settings WHERE key=?").get("billCounter")?.value ?? "1", 10);
    this.db.prepare("UPDATE Settings SET value=?,updatedAt=? WHERE key='billCounter'").run(String(counter+1), new Date().toISOString());
    return `${prefix}-${String(counter).padStart(6,"0")}`;
  }
  create(input: CreateBillInput): number {
    const now = new Date().toISOString();
    return this.transaction(() => {
      const billNumber = this.nextBillNumber();
      const r = this.db.prepare(`INSERT INTO Bill(billNumber,customerId,subtotal,gstTotal,discount,roundOff,grandTotal,amountPaid,changeDue,paymentMethod,note,createdAt,updatedAt,createdBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(billNumber,input.customerId??null,input.subtotal,input.gstTotal,input.discount,input.roundOff,input.grandTotal,input.amountPaid,input.changeDue,input.paymentMethod,input.note??null,now,now,input.createdBy??"system");
      const billId = r.lastInsertRowid as number;
      const stmt = this.db.prepare(`INSERT INTO BillItem(billId,productId,productName,quantity,unitPrice,costPrice,gstRate,gstAmount,lineTotal) VALUES (?,?,?,?,?,?,?,?,?)`);
      for (const item of input.items) stmt.run(billId,item.productId,item.productName,item.quantity,item.unitPrice,item.costPrice,item.gstRate,item.gstAmount,item.lineTotal);
      this.audit("Bill","INSERT",billId,null,{billNumber,grandTotal:input.grandTotal},input.createdBy??"system");
      return billId;
    });
  }
  getById(id: number): (BillRow & { items: BillItemRow[] }) | undefined {
    const bill = this.db.prepare<[number],BillRow>(`SELECT b.*,c.name AS customerName FROM Bill b LEFT JOIN Customer c ON c.id=b.customerId WHERE b.id=?`).get(id);
    if (!bill) return undefined;
    return { ...bill, items: this.db.prepare<[number],BillItemRow>("SELECT * FROM BillItem WHERE billId=?").all(id) };
  }
  getRecent(limit = 50): BillRow[] {
    return this.db.prepare<[],BillRow>(`SELECT b.*,c.name AS customerName FROM Bill b LEFT JOIN Customer c ON c.id=b.customerId ORDER BY b.createdAt DESC LIMIT ${limit}`).all();
  }
  search(query: string): BillRow[] {
    const like = `%${query}%`;
    return this.db.prepare<[string,string],BillRow>(`SELECT b.*,c.name AS customerName FROM Bill b LEFT JOIN Customer c ON c.id=b.customerId WHERE b.billNumber LIKE ? OR c.name LIKE ? ORDER BY b.createdAt DESC LIMIT 50`).all(like,like);
  }
  refund(billId: number, amount: number, reason: string, refundedBy: string): number {
    const now = new Date().toISOString();
    const r = this.db.prepare("INSERT INTO Refund(billId,amount,reason,refundedBy,createdAt) VALUES (?,?,?,?,?)").run(billId,amount,reason,refundedBy,now);
    this.db.prepare("UPDATE Bill SET status='REFUNDED',updatedAt=? WHERE id=?").run(now,billId);
    this.audit("Refund","INSERT",r.lastInsertRowid as number,null,{billId,amount,reason},refundedBy);
    return r.lastInsertRowid as number;
  }
}


===== FILE: features\billing\schemas\index.ts =====

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


===== FILE: features\billing\services\billing.service.ts =====

import { BillRepository } from "../repositories/bill.repository";
import { StockRepository } from "../../inventory/repositories/stock.repository";
import { CustomerRepository } from "../../customers/repositories/customer.repository";
import { withTransaction } from "../../../database/client";
import type { CreateBillInput, BillRow, BillItemRow } from "../types";

const billRepo = new BillRepository();
const stockRepo = new StockRepository();
const customerRepo = new CustomerRepository();

export interface BillResult {
  billId: number;
  billNumber: string;
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  creditBalance: number | null;
}

export const billingService = {
  createBill(input: CreateBillInput): BillResult {
    // Step 1: stock check BEFORE opening transaction
    for (const item of input.items) {
      const stock = stockRepo.getByProduct(item.productId);
      if (stock < item.quantity)
        throw new Error(`Insufficient stock for ${item.productName}. Available: ${stock}`);
    }

    return withTransaction(() => {
      // Step 2: Create bill record
      const billId = billRepo.create(input);

      // Step 3: Deduct stock for every item sold
      for (const item of input.items) {
        stockRepo.adjust(
          item.productId, "SALE", item.quantity, item.costPrice,
          billId, `Bill #${billId}`, input.createdBy ?? "system"
        );
      }

      // Step 4: If khata/credit sale â†’ add ledger entry
      if (input.paymentMethod === "CREDIT" && input.customerId) {
        customerRepo.addCreditLedger(
          input.customerId, "DEBIT", input.grandTotal, billId, "Credit sale"
        );
      }

      // Step 5: Fetch bill number
      const bill = billRepo.getById(billId);

      // Step 6: Fetch fresh customer data (balance updated by step 4)
      let customerPhone: string | null = null;
      let customerName: string | null = null;
      let creditBalance: number | null = null;

      if (input.customerId) {
        const customer = customerRepo.getById(input.customerId);
        if (customer) {
          customerPhone = customer.phone ?? null;
          customerName = customer.name;
          creditBalance = customer.creditBalance;
        }
      }

      return {
        billId,
        billNumber: bill?.billNumber ?? `#${billId}`,
        customerId: input.customerId ?? null,
        customerName,
        customerPhone,
        creditBalance,
      };
    });
  },

  getBill(id: number): (BillRow & { items: BillItemRow[] }) | null {
    return billRepo.getById(id) ?? null;
  },

  getRecent(limit?: number): BillRow[] { return billRepo.getRecent(limit); },

  search(query: string): BillRow[] { return billRepo.search(query); },

  refund(billId: number, amount: number, reason: string, refundedBy: string): number {
    const bill = billRepo.getById(billId);
    if (!bill) throw new Error("Bill not found");
    if (bill.status === "REFUNDED") throw new Error("Bill already refunded");
    return withTransaction(() => {
      const refundId = billRepo.refund(billId, amount, reason, refundedBy);
      for (const item of bill.items) {
        stockRepo.adjust(item.productId, "REFUND", item.quantity, item.costPrice,
          billId, `Refund for bill #${billId}`, refundedBy);
      }
      if (bill.paymentMethod === "CREDIT" && bill.customerId) {
        customerRepo.addCreditLedger(bill.customerId, "CREDIT", amount, billId, `Refund: ${reason}`);
      }
      return refundId;
    });
  },
};

===== FILE: features\billing\stores\cart.store.ts =====

import { create } from "zustand";
import type { CartItem, BillTotals } from "../types";
import type { PaymentMethod } from "../../../shared/types";

function calcItem(i: Omit<CartItem,"gstAmount"|"lineTotal">): CartItem {
  const base = i.unitPrice * i.quantity;
  const gstAmount = Math.round(base * i.gstRate / 100);
  return { ...i, gstAmount, lineTotal: base + gstAmount };
}

interface CartState {
  items: CartItem[]; discount: number; customerId: number | null; customerName: string | null; paymentMethod: PaymentMethod;
  addItem: (i: Omit<CartItem,"gstAmount"|"lineTotal">) => void;
  updateQty: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
  setDiscount: (p: number) => void;
  setCustomer: (id: number | null, name: string | null) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  clearCart: () => void;
  getTotals: () => BillTotals;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [], discount: 0, customerId: null, customerName: null, paymentMethod: "CASH",
  addItem: (newItem) => set((s) => {
    const idx = s.items.findIndex((i) => i.productId === newItem.productId);
    if (idx >= 0) return { items: s.items.map((i,n) => n === idx ? calcItem({...i, quantity: i.quantity + newItem.quantity}) : i) };
    return { items: [...s.items, calcItem(newItem)] };
  }),
  updateQty: (productId, qty) => {
    if (qty <= 0) { get().removeItem(productId); return; }
    set((s) => ({ items: s.items.map((i) => i.productId === productId ? calcItem({...i, quantity: qty}) : i) }));
  },
  removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  setDiscount: (discount) => set({ discount }),
  setCustomer: (customerId, customerName) => set({ customerId, customerName }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  clearCart: () => set({ items: [], discount: 0, customerId: null, customerName: null, paymentMethod: "CASH" }),
  getTotals: (): BillTotals => {
    const { items, discount } = get();
    const subtotal = items.reduce((s,i) => s + i.unitPrice * i.quantity, 0);
    const gstTotal = items.reduce((s,i) => s + i.gstAmount, 0);
    const afterDisc = subtotal + gstTotal - discount;
    const roundOff = Math.round(afterDisc / 100) * 100 - afterDisc;
    return { subtotal, gstTotal, discount, roundOff, grandTotal: afterDisc + roundOff };
  },
}));


===== FILE: features\billing\types\index.ts =====

import type { PaymentMethod, BillStatus } from "../../../shared/types";
export interface CartItem { productId: number; productName: string; barcode: string | null; unit: string; quantity: number; unitPrice: number; costPrice: number; gstRate: number; gstAmount: number; lineTotal: number; }
export interface BillTotals { subtotal: number; gstTotal: number; discount: number; roundOff: number; grandTotal: number; }
export interface CreateBillInput { customerId?: number; items: Array<{productId:number;productName:string;quantity:number;unitPrice:number;costPrice:number;gstRate:number;gstAmount:number;lineTotal:number}>; subtotal:number; gstTotal:number; discount:number; roundOff:number; grandTotal:number; amountPaid:number; changeDue:number; paymentMethod:PaymentMethod; note?:string; createdBy?:string; }
export interface BillRow { id:number; billNumber:string; customerId:number|null; customerName:string|null; status:BillStatus; subtotal:number; gstTotal:number; discount:number; roundOff:number; grandTotal:number; amountPaid:number; changeDue:number; paymentMethod:PaymentMethod; note:string|null; createdAt:string; updatedAt:string; createdBy:string; }
export interface BillItemRow { id:number; billId:number; productId:number; productName:string; quantity:number; unitPrice:number; costPrice:number; gstRate:number; gstAmount:number; lineTotal:number; }


===== FILE: features\categories\repositories\category.repository.ts =====

import { BaseRepository } from "../../../database/repositories/base.repository";

import type { Category } from "../types";

export class CategoryRepository extends BaseRepository {
  getAll(): Category[] {
    return this.db.prepare<[], Category>(`SELECT c.id,c.name,COUNT(p.id) AS productCount FROM Category c LEFT JOIN Product p ON p.categoryId=c.id AND p.isActive=1 GROUP BY c.id ORDER BY c.name`).all();
  }
  getById(id: number): Category | undefined {
    return this.db.prepare<[number], Category>(`SELECT c.id,c.name,COUNT(p.id) AS productCount FROM Category c LEFT JOIN Product p ON p.categoryId=c.id AND p.isActive=1 WHERE c.id=? GROUP BY c.id`).get(id);
  }
  create(name: string, createdBy = "system"): number {
    const r = this.db.prepare("INSERT INTO Category(name) VALUES (?)").run(name);
    const id = r.lastInsertRowid as number;
    this.audit("Category","INSERT",id,null,{name},createdBy);
    return id;
  }
  update(id: number, name: string, createdBy = "system"): boolean {
    const old = this.getById(id);
    const r = this.db.prepare("UPDATE Category SET name=? WHERE id=?").run(name, id);
    if (r.changes > 0) this.audit("Category","UPDATE",id,old,{name},createdBy);
    return r.changes > 0;
  }
  delete(id: number, createdBy = "system"): boolean {
    const old = this.getById(id);
    const r = this.db.prepare("DELETE FROM Category WHERE id=?").run(id);
    if (r.changes > 0) this.audit("Category","DELETE",id,old,null,createdBy);
    return r.changes > 0;
  }
}


===== FILE: features\categories\schemas\index.ts =====

import { z } from "zod";
export const categorySchema = z.object({ name: z.string().min(1,"Required").max(100) });
export type CategorySchema = z.infer<typeof categorySchema>;


===== FILE: features\categories\services\category.service.ts =====

import { CategoryRepository } from "../repositories/category.repository";
import type { Category } from "../types";

const repo = new CategoryRepository();

export const categoryService = {
  getAll(): Category[] { return repo.getAll(); },
  create(name: string, createdBy?: string): number {
    const existing = repo.getAll().find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) throw new Error(`Category "${name}" already exists`);
    return repo.create(name, createdBy);
  },
  update(id: number, name: string, createdBy?: string): boolean { return repo.update(id, name, createdBy); },
  delete(id: number, createdBy?: string): boolean {
    const cat = repo.getById(id);
    if (cat && cat.productCount > 0) throw new Error(`Cannot delete: ${cat.productCount} products use this category`);
    return repo.delete(id, createdBy);
  },
};


===== FILE: features\categories\types\index.ts =====

export interface Category { id: number; name: string; productCount: number; }
export interface CreateCategoryInput { name: string; }


===== FILE: features\customers\repositories\customer.repository.ts =====

import { BaseRepository } from "../../../database/repositories/base.repository";
import type { CreateCustomerInput, UpdateCustomerInput, LedgerEntry } from "../types";

export interface CustomerRow { id: number; name: string; phone: string | null; address: string | null; creditLimit: number; creditBalance: number; isActive: number; createdAt: string; updatedAt: string; }

export class CustomerRepository extends BaseRepository {
  getAll(): CustomerRow[] { return this.db.prepare<[],CustomerRow>("SELECT * FROM Customer WHERE isActive=1 ORDER BY name").all(); }
  getById(id: number): CustomerRow | undefined { return this.db.prepare<[number],CustomerRow>("SELECT * FROM Customer WHERE id=?").get(id); }
  search(q: string): CustomerRow[] {
    const like = `%${q}%`;
    return this.db.prepare<[string,string],CustomerRow>("SELECT * FROM Customer WHERE isActive=1 AND (name LIKE ? OR phone LIKE ?) ORDER BY name LIMIT 20").all(like,like);
  }
  create(i: CreateCustomerInput, createdBy = "system"): number {
    const now = new Date().toISOString();
    const r = this.db.prepare("INSERT INTO Customer(name,phone,address,creditLimit,createdAt,updatedAt) VALUES (?,?,?,?,?,?)").run(i.name,i.phone??null,i.address??null,i.creditLimit??0,now,now);
    const id = r.lastInsertRowid as number;
    this.audit("Customer","INSERT",id,null,i,createdBy);
    return id;
  }
  update(i: UpdateCustomerInput, createdBy = "system"): boolean {
    const old = this.getById(i.id);
    const fields: Record<string,unknown> = {};
    if (i.name !== undefined) fields["name"] = i.name;
    if (i.phone !== undefined) fields["phone"] = i.phone;
    if (i.address !== undefined) fields["address"] = i.address;
    if (i.creditLimit !== undefined) fields["creditLimit"] = i.creditLimit;
    if (i.isActive !== undefined) fields["isActive"] = i.isActive ? 1 : 0;
    fields["updatedAt"] = new Date().toISOString();
    const { set, vals } = this.buildSet(fields);
    const r = this.db.prepare(`UPDATE Customer SET ${set} WHERE id=?`).run(...vals, i.id);
    if (r.changes > 0) this.audit("Customer","UPDATE",i.id,old,i,createdBy);
    return r.changes > 0;
  }
  addCreditLedger(customerId: number, type: "CREDIT"|"DEBIT"|"SETTLEMENT", amount: number, billId?: number, note?: string): void {
    this.db.prepare("INSERT INTO CreditLedger(customerId,type,amount,billId,note) VALUES (?,?,?,?,?)").run(customerId,type,amount,billId??null,note??null);
    const delta = type === "DEBIT" ? amount : -amount;
    this.db.prepare("UPDATE Customer SET creditBalance=creditBalance+?,updatedAt=? WHERE id=?").run(delta,new Date().toISOString(),customerId);
  }
  getLedger(customerId: number, limit = 100): LedgerEntry[] {
    return this.db.prepare<[number],LedgerEntry>("SELECT * FROM CreditLedger WHERE customerId=? ORDER BY createdAt DESC LIMIT "+limit).all(customerId);
  }
}


===== FILE: features\customers\schemas\index.ts =====

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


===== FILE: features\customers\services\customer.service.ts =====

import { CustomerRepository } from "../repositories/customer.repository";
import type { Customer, LedgerEntry, CreateCustomerInput, UpdateCustomerInput } from "../types";

const repo = new CustomerRepository();

export const customerService = {
  getAll(): Customer[] { return repo.getAll().map((r) => ({ ...r, isActive: r.isActive === 1 })); },
  getById(id: number): Customer {
    const r = repo.getById(id);
    if (!r) throw new Error("Customer not found");
    return { ...r, isActive: r.isActive === 1 };
  },
  search(q: string): Customer[] { return repo.search(q).map((r) => ({ ...r, isActive: r.isActive === 1 })); },
  create(input: CreateCustomerInput, createdBy?: string): number { return repo.create(input, createdBy); },
  update(input: UpdateCustomerInput, createdBy?: string): boolean { return repo.update(input, createdBy); },
  getLedger(customerId: number): LedgerEntry[] { return repo.getLedger(customerId); },
  settle(input: { customerId: number; amount: number; note?: string }, _createdBy = "system"): void {
    const customer = repo.getById(input.customerId);
    if (!customer) throw new Error("Customer not found");
    if (input.amount > customer.creditBalance) throw new Error(`Amount exceeds outstanding balance of â‚¹${(customer.creditBalance/100).toFixed(2)}`);
    repo.addCreditLedger(input.customerId, "SETTLEMENT", input.amount, undefined, input.note ?? "Settlement");
  },
};


===== FILE: features\customers\types\index.ts =====

export interface Customer { id: number; name: string; phone: string | null; address: string | null; creditLimit: number; creditBalance: number; isActive: boolean; createdAt: string; updatedAt: string; }
export interface LedgerEntry { id: number; customerId: number; type: "CREDIT"|"DEBIT"|"SETTLEMENT"; amount: number; billId: number | null; note: string | null; createdAt: string; }
export interface CreateCustomerInput { name: string; phone?: string; address?: string; creditLimit?: number; }
export interface UpdateCustomerInput { id: number; name?: string; phone?: string | null; address?: string | null; creditLimit?: number; isActive?: boolean; }


===== FILE: features\inventory\repositories\stock.repository.ts =====

import { BaseRepository } from "../../../database/repositories/base.repository";
import type { StockMovementType } from "../../../shared/types";
import type { StockRow, MovementRow } from "../types";


export class StockRepository extends BaseRepository {
  getAll(): StockRow[] {
    return this.db.prepare<[], StockRow>(`SELECT s.productId,p.name AS productName,p.unit,s.quantity,p.lowStockAlert FROM Stock s JOIN Product p ON p.id=s.productId WHERE p.isActive=1 ORDER BY p.name`).all();
  }
  getLowStock(): StockRow[] {
    return this.db.prepare<[], StockRow>(`SELECT s.productId,p.name AS productName,p.unit,s.quantity,p.lowStockAlert FROM Stock s JOIN Product p ON p.id=s.productId WHERE p.isActive=1 AND s.quantity<=p.lowStockAlert ORDER BY s.quantity`).all();
  }
  getExpiringSoon(): (StockRow & { expiryDate: string; daysLeft: number })[] {
    return this.db.prepare<[], StockRow & { expiryDate: string; daysLeft: number }>(`
      SELECT s.productId, p.name AS productName, p.unit, s.quantity, p.lowStockAlert,
             p.expiryDate,
             CAST(julianday(p.expiryDate) - julianday('now') AS INTEGER) AS daysLeft
      FROM Stock s JOIN Product p ON p.id = s.productId
      WHERE p.isActive = 1 AND p.expiryDate IS NOT NULL
        AND julianday(p.expiryDate) - julianday('now') <= p.expiryAlertDays
      ORDER BY p.expiryDate ASC
    `).all();
  }
  getByProduct(productId: number): number {
    return this.db.prepare<[number],{quantity:number}>("SELECT COALESCE(quantity,0) AS quantity FROM Stock WHERE productId=?").get(productId)?.quantity ?? 0;
  }
  adjust(productId: number, type: StockMovementType, quantity: number, costPrice = 0, referenceId?: number, note?: string, createdBy = "system"): number {
    const out = ["SALE","ADJUSTMENT_OUT","DAMAGE"];
    const delta = out.includes(type) ? -Math.abs(quantity) : Math.abs(quantity);
    const now = new Date().toISOString();
    return this.transaction(() => {
      this.db.prepare(`INSERT INTO Stock(productId,quantity,updatedAt) VALUES (?,MAX(0,?),?) ON CONFLICT(productId) DO UPDATE SET quantity=MAX(0,quantity+excluded.quantity),updatedAt=excluded.updatedAt`)
        .run(productId, delta, now);
      this.db.prepare(`INSERT INTO StockMovement(productId,type,quantity,costPrice,referenceId,note,createdAt,createdBy) VALUES (?,?,?,?,?,?,?,?)`)
        .run(productId, type, quantity, costPrice, referenceId??null, note??null, now, createdBy);
      return this.db.prepare<[number],{quantity:number}>("SELECT quantity FROM Stock WHERE productId=?").get(productId)?.quantity ?? 0;
    });
  }
  getMovements(productId: number, limit = 50): MovementRow[] {
    return this.db.prepare<[number],MovementRow>(`SELECT sm.*,p.name AS productName FROM StockMovement sm JOIN Product p ON p.id=sm.productId WHERE sm.productId=? ORDER BY sm.createdAt DESC LIMIT ${limit}`).all(productId);
  }
}


===== FILE: features\inventory\schemas\index.ts =====

import { z } from "zod";
export const adjustStockSchema = z.object({
  productId: z.number().int().positive(),
  type: z.enum(["PURCHASE","ADJUSTMENT_IN","ADJUSTMENT_OUT","DAMAGE","OPENING_STOCK"]),
  quantity: z.number().int().positive("Must be > 0"),
  costPrice: z.number().min(0).optional(),
  note: z.string().max(300).optional(),
});
export type AdjustStockSchema = z.infer<typeof adjustStockSchema>;


===== FILE: features\inventory\services\inventory.service.ts =====

import { StockRepository } from "../repositories/stock.repository";
import type { StockMovementType } from "../../../shared/types";

const repo = new StockRepository();

export const inventoryService = {
  getAll() { return repo.getAll(); },
  getLowStock() { return repo.getLowStock(); },
  getExpiringSoon() { return repo.getExpiringSoon(); },
  getByProduct(productId: number) { return repo.getByProduct(productId); },
  adjust(productId: number, type: StockMovementType, quantity: number, costPrice = 0, referenceId?: number, note?: string, createdBy = "system"): number {
    if (type === "SALE" || type === "ADJUSTMENT_OUT" || type === "DAMAGE") {
      const current = repo.getByProduct(productId);
      if (current < quantity) throw new Error(`Insufficient stock. Available: ${current}`);
    }
    return repo.adjust(productId, type, quantity, costPrice, referenceId, note, createdBy);
  },
  getMovements(productId: number, limit?: number) { return repo.getMovements(productId, limit); },
};


===== FILE: features\inventory\types\index.ts =====

export interface StockRow { productId: number; productName: string; unit: string; quantity: number; lowStockAlert: number; }
export interface MovementRow { id: number; productId: number; productName: string; type: string; quantity: number; costPrice: number; referenceId: number | null; note: string | null; createdAt: string; createdBy: string; }


===== FILE: features\products\components\product-dialog.tsx =====

"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
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
        expiryDate: product.expiryDate ?? undefined,
        expiryAlertDays: product.expiryAlertDays ?? 30,
      });
    } else {
      reset({ unit: "PCS", gstRate: 0, lowStockAlert: 10, openingStock: 0, costPrice: 0, sellingPrice: 0, mrp: 0, expiryAlertDays: 30 });
    }
  }, [open, product, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        costPrice: rupeesToPaise(data.costPrice),
        sellingPrice: rupeesToPaise(data.sellingPrice),
        mrp: rupeesToPaise(data.mrp),
        expiryDate: data.expiryDate || undefined,
      };
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
            <div className="space-y-1.5"><Label>Cost Price (â‚¹) *</Label><Input type="number" step="0.01" min="0" {...register("costPrice", { valueAsNumber: true })} /></div>
            <div className="space-y-1.5"><Label>Selling Price (â‚¹) *</Label><Input type="number" step="0.01" min="0" {...register("sellingPrice", { valueAsNumber: true })} /></div>
            <div className="space-y-1.5"><Label>MRP (â‚¹) *</Label><Input type="number" step="0.01" min="0" {...register("mrp", { valueAsNumber: true })} /></div>
            <div className="space-y-1.5">
              <Label>GST Rate *</Label>
              <Controller name="gstRate" control={control} render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GST_RATES.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5"><Label>HSN Code</Label><Input {...register("hsnCode")} placeholder="e.g. 1001" /></div>
            <div className="space-y-1.5"><Label>Low Stock Alert</Label><Input type="number" min="0" {...register("lowStockAlert", { valueAsNumber: true })} /></div>
            {!isEdit && <div className="space-y-1.5"><Label>Opening Stock</Label><Input type="number" min="0" {...register("openingStock", { valueAsNumber: true })} /></div>}

            {/* Expiry tracking */}
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input type="date" {...register("expiryDate")} />
              <p className="text-xs text-muted-foreground">Leave blank if product has no expiry</p>
            </div>
            <div className="space-y-1.5">
              <Label>Alert Before (days)</Label>
              <Input type="number" min="1" {...register("expiryAlertDays", { valueAsNumber: true })} />
              <p className="text-xs text-muted-foreground">Warn this many days before expiry</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Savingâ€¦" : isEdit ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

===== FILE: features\products\repositories\product.repository.ts =====

import { BaseRepository } from "../../../database/repositories/base.repository";
import type { CreateProductInput, UpdateProductInput } from "../types";

export interface ProductRow {
  id: number; barcode: string | null; name: string; description: string | null;
  categoryId: number | null; categoryName: string | null; unit: string;
  costPrice: number; sellingPrice: number; mrp: number; gstRate: number;
  hsnCode: string | null; isActive: number; lowStockAlert: number;
  stock: number; createdAt: string; updatedAt: string;
  expiryDate: string | null; expiryAlertDays: number;
}

const SEL = `SELECT p.*, c.name AS categoryName, COALESCE(s.quantity,0) AS stock
  FROM Product p LEFT JOIN Category c ON c.id=p.categoryId LEFT JOIN Stock s ON s.productId=p.id`;

export class ProductRepository extends BaseRepository {
  getAll(): ProductRow[] { return this.db.prepare<[], ProductRow>(`${SEL} WHERE p.isActive=1 ORDER BY p.name`).all(); }
  getById(id: number): ProductRow | undefined { return this.db.prepare<[number], ProductRow>(`${SEL} WHERE p.id=?`).get(id); }
  getByBarcode(b: string): ProductRow | undefined { return this.db.prepare<[string], ProductRow>(`${SEL} WHERE p.barcode=? AND p.isActive=1`).get(b); }
  search(q: string, limit = 20): ProductRow[] {
    const like = `%${q}%`;
    return this.db.prepare<[string, string], ProductRow>(`${SEL} WHERE p.isActive=1 AND (p.name LIKE ? OR p.barcode LIKE ?) ORDER BY p.name LIMIT ${limit}`).all(like, like);
  }
  create(i: CreateProductInput, createdBy = "system"): number {
    const now = new Date().toISOString();
    const r = this.db.prepare(
      `INSERT INTO Product(barcode,name,description,categoryId,unit,costPrice,sellingPrice,mrp,gstRate,hsnCode,lowStockAlert,expiryDate,expiryAlertDays,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      i.barcode ?? null, i.name, i.description ?? null, i.categoryId ?? null,
      i.unit, i.costPrice, i.sellingPrice, i.mrp, i.gstRate, i.hsnCode ?? null,
      i.lowStockAlert, i.expiryDate ?? null, i.expiryAlertDays ?? 30, now, now
    );
    const id = r.lastInsertRowid as number;
    this.db.prepare("INSERT INTO Stock(productId,quantity,updatedAt) VALUES (?,?,?)").run(id, i.openingStock ?? 0, now);
    if ((i.openingStock ?? 0) > 0) {
      this.db.prepare(`INSERT INTO StockMovement(productId,type,quantity,costPrice,note,createdAt,createdBy) VALUES (?,?,?,?,?,?,?)`)
        .run(id, "OPENING_STOCK", i.openingStock, i.costPrice, "Opening stock", now, createdBy);
    }
    this.audit("Product", "INSERT", id, null, i, createdBy);
    return id;
  }
  update(i: UpdateProductInput, createdBy = "system"): boolean {
    const old = this.getById(i.id);
    const fields: Record<string, unknown> = {};
    const keys = ["barcode","name","description","categoryId","unit","costPrice","sellingPrice","mrp","gstRate","hsnCode","isActive","lowStockAlert","expiryDate","expiryAlertDays"] as const;
    for (const k of keys) {
      if ((i as unknown as Record<string, unknown>)[k] !== undefined) {
        fields[k] = k === "isActive" ? ((i[k] as boolean) ? 1 : 0) : (i as unknown as Record<string, unknown>)[k];
      }
    }
    fields["updatedAt"] = new Date().toISOString();
    const { set, vals } = this.buildSet(fields);
    const res = this.db.prepare(`UPDATE Product SET ${set} WHERE id=?`).run(...vals, i.id);
    if (res.changes > 0) this.audit("Product", "UPDATE", i.id, old, i, createdBy);
    return res.changes > 0;
  }
  softDelete(id: number, createdBy = "system"): boolean {
    const old = this.getById(id);
    const r = this.db.prepare("UPDATE Product SET isActive=0,updatedAt=? WHERE id=?").run(new Date().toISOString(), id);
    if (r.changes > 0) this.audit("Product", "DELETE", id, old, null, createdBy);
    return r.changes > 0;
  }
}

===== FILE: features\products\schemas\index.ts =====

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
  expiryDate: z.string().optional(),               // NEW â€” "YYYY-MM-DD"
  expiryAlertDays: z.number().int().min(1).default(30), // NEW
});
export const updateProductSchema = createProductSchema.partial().extend({ id: z.number().int().positive() });
export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;


===== FILE: features\products\services\product.service.ts =====

import { ProductRepository } from "../repositories/product.repository";
import type { CreateProductInput, UpdateProductInput, Product } from "../types";

const repo = new ProductRepository();

export const productService = {
  getAll(): Product[] {
    return repo.getAll().map((r) => ({
      ...r,
      isActive: r.isActive === 1,
      expiryDate: r.expiryDate ?? null,
      expiryAlertDays: r.expiryAlertDays ?? 30,
    }));
  },
  getById(id: number): Product {
    const r = repo.getById(id);
    if (!r) throw new Error("Product not found");
    return { ...r, isActive: r.isActive === 1, expiryDate: r.expiryDate ?? null, expiryAlertDays: r.expiryAlertDays ?? 30 };
  },
  getByBarcode(barcode: string): Product | null {
    const r = repo.getByBarcode(barcode);
    return r ? { ...r, isActive: r.isActive === 1, expiryDate: r.expiryDate ?? null, expiryAlertDays: r.expiryAlertDays ?? 30 } : null;
  },
  search(q: string): Product[] {
    return repo.search(q).map((r) => ({
      ...r,
      isActive: r.isActive === 1,
      expiryDate: r.expiryDate ?? null,
      expiryAlertDays: r.expiryAlertDays ?? 30,
    }));
  },
  create(input: CreateProductInput, createdBy?: string): number { return repo.create(input, createdBy); },
  update(input: UpdateProductInput, createdBy?: string): boolean { return repo.update(input, createdBy); },
  delete(id: number, createdBy?: string): boolean { return repo.softDelete(id, createdBy); },
};

===== FILE: features\products\types\index.ts =====

export interface Product {
  id: number; barcode: string | null; name: string; description: string | null;
  categoryId: number | null; categoryName: string | null; unit: string;
  costPrice: number; sellingPrice: number; mrp: number; gstRate: number;
  hsnCode: string | null; isActive: boolean; lowStockAlert: number; stock: number;
  expiryDate: string | null; expiryAlertDays: number;   // NEW
  createdAt: string; updatedAt: string;
}
export interface CreateProductInput {
  barcode?: string; name: string; description?: string; categoryId?: number; unit: string;
  costPrice: number; sellingPrice: number; mrp: number; gstRate: number; hsnCode?: string;
  lowStockAlert: number; openingStock: number;
  expiryDate?: string; expiryAlertDays?: number;   // NEW
}
export interface UpdateProductInput {
  id: number; barcode?: string | null; name?: string; description?: string | null;
  categoryId?: number | null; unit?: string; costPrice?: number; sellingPrice?: number;
  mrp?: number; gstRate?: number; hsnCode?: string | null; isActive?: boolean; lowStockAlert?: number;
  expiryDate?: string | null; expiryAlertDays?: number;   // NEW
}

===== FILE: features\reports\services\report.service.ts =====

import { getDatabase } from "../../../database/client";
import type { DailySalesRow, ProductSalesRow, GstRow, StockValuationRow } from "../types";

const db = () => getDatabase();

export const reportService = {
  dailySales(from: string, to: string): DailySalesRow[] {
    return db().prepare<[string, string], DailySalesRow>(
      `SELECT date(b.createdAt) AS date, COUNT(*) AS billCount,
        SUM(b.subtotal) AS subtotal, SUM(b.gstTotal) AS gstTotal, SUM(b.discount) AS discount, SUM(b.grandTotal) AS grandTotal,
        SUM(CASE WHEN b.paymentMethod='CASH' THEN b.grandTotal ELSE 0 END) AS cashTotal,
        SUM(CASE WHEN b.paymentMethod='UPI' THEN b.grandTotal ELSE 0 END) AS upiTotal,
        SUM(CASE WHEN b.paymentMethod='CREDIT' THEN b.grandTotal ELSE 0 END) AS creditTotal,
        SUM(CASE WHEN b.paymentMethod='CARD' THEN b.grandTotal ELSE 0 END) AS cardTotal
       FROM Bill b WHERE b.status!='REFUNDED' AND date(b.createdAt) BETWEEN date(?) AND date(?)
       GROUP BY date(b.createdAt) ORDER BY date(b.createdAt) DESC`
    ).all(from, to);
  },

  productSales(from: string, to: string): ProductSalesRow[] {
    return db().prepare<[string, string], ProductSalesRow>(
      `SELECT bi.productId, bi.productName, p.unit, SUM(bi.quantity) AS quantitySold,
        SUM(bi.lineTotal) AS revenue, SUM(bi.quantity*bi.costPrice) AS cost,
        SUM(bi.lineTotal - bi.quantity*bi.costPrice) AS profit
       FROM BillItem bi JOIN Bill b ON b.id=bi.billId JOIN Product p ON p.id=bi.productId
       WHERE b.status!='REFUNDED' AND date(b.createdAt) BETWEEN date(?) AND date(?)
       GROUP BY bi.productId ORDER BY revenue DESC`
    ).all(from, to);
  },

  slowMoving(days = 30): { productId: number; productName: string; unit: string; quantity: number; lastSoldAt: string | null }[] {
    return db().prepare<[number], { productId: number; productName: string; unit: string; quantity: number; lastSoldAt: string | null }>(
      `SELECT p.id AS productId, p.name AS productName, p.unit,
              COALESCE(s.quantity, 0) AS quantity,
              MAX(b.createdAt) AS lastSoldAt
       FROM Product p
       LEFT JOIN Stock s ON s.productId = p.id
       LEFT JOIN BillItem bi ON bi.productId = p.id
       LEFT JOIN Bill b ON b.id = bi.billId AND b.status != 'REFUNDED'
       WHERE p.isActive = 1 AND COALESCE(s.quantity, 0) > 0
       GROUP BY p.id
       HAVING lastSoldAt IS NULL OR CAST(julianday('now') - julianday(lastSoldAt) AS INTEGER) >= ?
       ORDER BY lastSoldAt ASC`
    ).all(days);
  },

  gstSummary(from: string, to: string): GstRow[] {
    return db().prepare<[string, string], GstRow>(
      `SELECT bi.gstRate, SUM(bi.quantity*bi.unitPrice) AS taxableAmount, SUM(bi.gstAmount) AS gstAmount
       FROM BillItem bi JOIN Bill b ON b.id=bi.billId
       WHERE b.status!='REFUNDED' AND date(b.createdAt) BETWEEN date(?) AND date(?)
       GROUP BY bi.gstRate ORDER BY bi.gstRate`
    ).all(from, to);
  },

  stockValuation(): StockValuationRow[] {
    return db().prepare<[], StockValuationRow>(
      `SELECT p.id AS productId, p.name AS productName, p.unit, COALESCE(s.quantity,0) AS quantity,
        p.costPrice, p.sellingPrice, COALESCE(s.quantity,0)*p.costPrice AS stockValue, COALESCE(s.quantity,0)*p.sellingPrice AS retailValue
       FROM Product p LEFT JOIN Stock s ON s.productId=p.id WHERE p.isActive=1 ORDER BY stockValue DESC`
    ).all();
  },

  profitLoss(from: string, to: string) {
    const sales = db().prepare<[string, string], { revenue: number; cost: number }>(
      `SELECT SUM(bi.lineTotal) AS revenue, SUM(bi.quantity*bi.costPrice) AS cost
       FROM Bill b JOIN BillItem bi ON bi.billId=b.id
       WHERE b.status!='REFUNDED' AND date(b.createdAt) BETWEEN date(?) AND date(?)`
    ).get(from, to);
    const refunds = db().prepare<[string, string], { total: number }>(
      `SELECT COALESCE(SUM(amount),0) AS total FROM Refund WHERE date(createdAt) BETWEEN date(?) AND date(?)`
    ).get(from, to);
    const revenue = sales?.revenue ?? 0;
    const cost = sales?.cost ?? 0;
    const refundTotal = refunds?.total ?? 0;
    return {
      revenue,
      cost,
      grossProfit: revenue - cost,
      refunds: refundTotal,
      netProfit: revenue - cost - refundTotal,
      margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
    };
  },
};

===== FILE: features\reports\types\index.ts =====

export interface DailySalesRow { date:string; billCount:number; subtotal:number; gstTotal:number; discount:number; grandTotal:number; cashTotal:number; upiTotal:number; creditTotal:number; cardTotal:number; }
export interface ProductSalesRow { productId:number; productName:string; unit:string; quantitySold:number; revenue:number; cost:number; profit:number; }
export interface GstRow { gstRate:number; taxableAmount:number; gstAmount:number; }
export interface StockValuationRow { productId:number; productName:string; unit:string; quantity:number; costPrice:number; sellingPrice:number; stockValue:number; retailValue:number; }


===== FILE: features\settings\services\settings.service.ts =====

import { getDatabase } from "../../../database/client";

import type { AppSettings } from "../types";

const db = () => getDatabase();

export const settingsService = {
  getAll(): AppSettings {
    const rows = db().prepare<[],{key:string;value:string}>("SELECT key,value FROM Settings").all();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      storeName: map["storeName"] ?? "", storeAddress: map["storeAddress"] ?? "", storePhone: map["storePhone"] ?? "",
      storeGstin: map["storeGstin"] ?? "", currency: map["currency"] ?? "INR", billPrefix: map["billPrefix"] ?? "INV",
      billCounter: map["billCounter"] ?? "1", taxIncluded: map["taxIncluded"] ?? "false",
      printReceiptAuto: map["printReceiptAuto"] ?? "true", theme: map["theme"] ?? "light",
      printerName: map["printerName"] ?? "", printerWidth: map["printerWidth"] ?? "80",
      excelExportFolderPath: map["excelExportFolderPath"] ?? "",
      lastDailySyncAt: map["lastDailySyncAt"] ?? "",
      lastMonthlySyncAt: map["lastMonthlySyncAt"] ?? "",
      googleSheetsEnabled: map["googleSheetsEnabled"] ?? "false",
      googleSheetsCredentialsPath: map["googleSheetsCredentialsPath"] ?? "",
      googleSheetsSpreadsheetId: map["googleSheetsSpreadsheetId"] ?? "",
    };
  },
  update(updates: Partial<AppSettings>): void {
    const now = new Date().toISOString();
    const stmt = db().prepare("INSERT INTO Settings(key,value,updatedAt) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updatedAt=excluded.updatedAt");
    db().transaction(() => { for (const [k,v] of Object.entries(updates)) if (v !== undefined) stmt.run(k, String(v), now); })();
  },
};

===== FILE: features\settings\types\index.ts =====

export interface AppSettings { storeName:string; 
    storeAddress:string; 
    storePhone:string; 
    storeGstin:string; 
    currency:string; 
    billPrefix:string; 
    billCounter:string; 
    taxIncluded:string; 
    printReceiptAuto:string; 
    theme:string; 
    printerName:string; 
    printerWidth:string; 
}
export interface AppSettings {
    storeName: string; storeAddress: string; storePhone: string; storeGstin: string;
    currency: string; billPrefix: string; billCounter: string; taxIncluded: string;
    printReceiptAuto: string; theme: string; printerName: string; printerWidth: string;
    excelExportFolderPath: string;
    lastDailySyncAt: string;
    lastMonthlySyncAt: string;
    googleSheetsEnabled: string;
    googleSheetsCredentialsPath: string;
    googleSheetsSpreadsheetId: string;
  }
