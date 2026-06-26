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
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Backup & Restore</h1><Button onClick={createBackup} disabled={creating}><Download className="h-4 w-4 mr-2" />{creating ? "Creating…" : "Create Backup"}</Button></div>
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
          <p className="font-semibold">⚠️ Restore Warning</p>
          <p>Restoring a backup will replace your entire database. A safety copy is created automatically before restore. Restart the application after restoring.</p>
        </CardContent>
      </Card>
    </div>
  );
}
