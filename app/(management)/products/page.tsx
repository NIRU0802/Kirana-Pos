"use client";
import { useEffect, useState, useCallback } from "react";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { Plus, Search, Pencil, Trash2, AlertTriangle, Upload } from "lucide-react";
import type { Product, BulkImportResult } from "@/features/products/types";
import { ProductDialog } from "@/features/products/components/product-dialog";
import { useToastEmitter } from "@/shared/hooks/use-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
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

  const handleImport = async () => {
    const filePath = await ipcInvoke<string | null>(IPC_CHANNELS.PRODUCT_PICK_IMPORT_FILE);
    if (!filePath) return;
    setImporting(true);
    try {
      const result = await ipcInvoke<BulkImportResult>(IPC_CHANNELS.PRODUCT_BULK_IMPORT, filePath);
      toast({
        title: `Import done: ${result.created} added, ${result.updated} updated, ${result.failed} failed`,
        variant: result.failed > 0 ? "destructive" : "success",
      });
      if (result.failed > 0) {
        console.error("Import errors:", result.errors);
      }
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Import failed", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport} disabled={importing}>
            <Upload className="h-4 w-4 mr-2" /> {importing ? "Importing…" : "Import Excel"}
          </Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name or barcode…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" /></div></CardHeader>
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
                  <TableCell className="text-muted-foreground text-xs">{p.barcode ?? "—"}</TableCell>
                  <TableCell>{p.categoryName ?? "—"}</TableCell>
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