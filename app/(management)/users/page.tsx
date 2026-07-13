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

  // ── guard — after all hooks ──────────────────────────────
  if (currentUser?.role !== "admin") {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <ShieldAlert className="h-10 w-10" />
        <p className="text-lg font-medium">Admin access only</p>
      </div>
    );
  }

  // ── Create ──────────────────────────────────────────────
  const onCreate = async (data: CreateForm) => {
    try {
      await ipcInvoke(IPC_CHANNELS.AUTH_CREATE_USER, data);
      toast({ title: `User "${data.username}" created`, variant: "success" });
      load(); setCreateOpen(false); createForm.reset({ role: "cashier" });
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  // ── Edit ────────────────────────────────────────────────
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

  // ── Reset password ───────────────────────────────────────
  const onReset = async (data: ResetForm) => {
    if (!resetTarget) return;
    try {
      await ipcInvoke(IPC_CHANNELS.AUTH_RESET_PASSWORD, resetTarget.id, data.password);
      toast({ title: `Password reset for "${resetTarget.username}"`, variant: "success" });
      setResetTarget(null); resetForm.reset();
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  // ── Delete ───────────────────────────────────────────────
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
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
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

      {/* ── Create dialog ── */}
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
                {createForm.formState.isSubmitting ? "Creating…" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit — {editTarget?.username}</DialogTitle></DialogHeader>
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
                {editForm.formState.isSubmitting ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Reset password dialog ── */}
      <Dialog open={!!resetTarget} onOpenChange={(v) => !v && setResetTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reset Password — {resetTarget?.username}</DialogTitle></DialogHeader>
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
                {resetForm.formState.isSubmitting ? "Resetting…" : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ── */}
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