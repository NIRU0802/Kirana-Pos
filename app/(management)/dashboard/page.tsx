"use client";
import { useEffect, useState } from "react";
import { ipcInvoke } from "@/shared/lib/ipc-client";
import { IPC_CHANNELS } from "@/shared/types/ipc";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { ShoppingCart, Package, AlertTriangle, TrendingUp } from "lucide-react";
import type { DailySalesRow } from "@/features/reports/types";
import type { StockRow } from "@/features/inventory/types";

export default function DashboardPage() {
  const [todaySales, setTodaySales] = useState<DailySalesRow | null>(null);
  const [lowStock, setLowStock] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      ipcInvoke<DailySalesRow[]>(IPC_CHANNELS.REPORT_DAILY_SALES, today, today),
      ipcInvoke<StockRow[]>(IPC_CHANNELS.INVENTORY_LOW_STOCK),
    ]).then(([sales, stock]) => { setTodaySales(sales[0] ?? null); setLowStock(stock); })
      .catch(console.error).finally(() => setLoading(false));
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
      {!loading && lowStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Low Stock Alerts</CardTitle></CardHeader>
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
