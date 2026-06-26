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
          <CardContent><div className="flex gap-2"><Button type="button" variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>☀️ Light</Button><Button type="button" variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>🌙 Dark</Button></div></CardContent>
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
              <p>Last daily sync: {watch("lastDailySyncAt") || "Never"}</p>
              <p>Last monthly merge: {watch("lastMonthlySyncAt") || "Never"}</p>
            </div>

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
            }}>{syncing ? "Syncing…" : "Sync Now"}</Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save Settings"}</Button>
      </form>
    </div>
  );
}