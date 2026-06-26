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
            <Button onClick={run} disabled={loading}>{loading ? "Loading…" : "Run Report"}</Button>
          </div>
        </CardContent>
      </Card>
      {tab === "daily" && daily.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Daily Sales — {from} to {to}</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Product Sales — {from} to {to}</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>GST Summary — {from} to {to}</CardTitle></CardHeader>
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
