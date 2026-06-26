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
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
