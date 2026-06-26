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
            <Button onClick={run} disabled={loading}>{loading ? "Loading…" : "Search"}</Button>
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
          <DialogHeader><DialogTitle>{detail?.action} — {detail?.table} #{detail?.recordId}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {detail?.oldData && <div><p className="font-semibold mb-2 text-red-600">Before</p><pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">{JSON.stringify(JSON.parse(detail.oldData), null, 2)}</pre></div>}
            {detail?.newData && <div><p className="font-semibold mb-2 text-green-600">After</p><pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">{JSON.stringify(JSON.parse(detail.newData), null, 2)}</pre></div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
