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
                    <span className="text-muted-foreground">{p.quantitySold} {p.unit} • {formatCurrency(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Slow Moving Stock (30+ days)</CardTitle></CardHeader>
          <CardContent>
            {slowMoving.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Nothing stagnant 🎉</p> : (
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