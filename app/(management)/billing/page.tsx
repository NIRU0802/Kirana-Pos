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
import { formatCurrency, rupeesToPaise } from "@/shared/lib/utils";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import { Barcode, Trash2, Plus, Minus, ShoppingCart, CreditCard, Banknote, Smartphone } from "lucide-react";
import type { Product } from "@/features/products/types";
import type { PaymentMethod } from "@/shared/types";

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  CASH: <Banknote className="h-4 w-4" />, UPI: <Smartphone className="h-4 w-4" />,
  CARD: <CreditCard className="h-4 w-4" />, CREDIT: <CreditCard className="h-4 w-4" />,
};

export default function BillingPage() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState("0");
  const barcodeRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastEmitter();

  const { items, paymentMethod, setPaymentMethod, addItem, updateQty, removeItem, setDiscount: storeSetDiscount, clearCart, getTotals } = useCartStore();
  const totals = getTotals();
  const change = Math.max(0, (parseFloat(amountPaid) * 100 || 0) - totals.grandTotal);

  useEffect(() => { barcodeRef.current?.focus(); }, []);

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

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchResults(await ipcInvoke<Product[]>(IPC_CHANNELS.PRODUCT_SEARCH, q));
    setSearchOpen(true);
  }, []);

  useEffect(() => { storeSetDiscount(rupeesToPaise(parseFloat(discount) || 0)); }, [discount, storeSetDiscount]);

  const handleCheckout = async () => {
    if (items.length === 0) { toast({ title: "Cart is empty", variant: "destructive" }); return; }
    const paid = Math.round((parseFloat(amountPaid) || 0) * 100);
    if (paymentMethod === "CASH" && paid < totals.grandTotal) { toast({ title: "Amount paid is less than total", variant: "destructive" }); return; }
    try {
      const billId = await ipcInvoke<number>(IPC_CHANNELS.BILL_CREATE, {
        items: items.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, costPrice: i.costPrice, gstRate: i.gstRate, gstAmount: i.gstAmount, lineTotal: i.lineTotal })),
        subtotal: totals.subtotal, gstTotal: totals.gstTotal, discount: totals.discount, roundOff: totals.roundOff, grandTotal: totals.grandTotal,
        amountPaid: paymentMethod === "CASH" ? paid : totals.grandTotal, changeDue: paymentMethod === "CASH" ? change : 0, paymentMethod,
      });
      toast({ title: `Bill #${billId} created`, variant: "success" });
      clearCart(); setAmountPaid(""); setDiscount("0");
      barcodeRef.current?.focus();
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Billing failed", variant: "destructive" }); }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col border-r">
        <div className="p-4 border-b space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input ref={barcodeRef} className="pl-9" placeholder="Scan barcode or press Enter…" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleBarcodeEnter()} />
            </div>
            <Input placeholder="Search by name…" className="flex-1" onChange={(e) => handleSearch(e.target.value)} onFocus={() => searchResults.length > 0 && setSearchOpen(true)} />
          </div>
        </div>
        {searchOpen && searchResults.length > 0 && (
          <div className="border-b max-h-48 overflow-y-auto">
            {searchResults.map((p) => (
              <button key={p.id} className="w-full flex items-center justify-between px-4 py-2 hover:bg-accent text-left text-sm border-b last:border-0"
                onClick={() => {
                  if (p.stock > 0) addItem({ productId: p.id, productName: p.name, barcode: p.barcode, unit: p.unit, quantity: 1, unitPrice: p.sellingPrice, costPrice: p.costPrice, gstRate: p.gstRate });
                  else toast({ title: "Out of stock", variant: "destructive" });
                  setSearchOpen(false);
                }}>
                <div><span className="font-medium">{p.name}</span><span className="text-muted-foreground ml-2 text-xs">{p.barcode}</span></div>
                <div className="flex items-center gap-3"><span>{formatCurrency(p.sellingPrice)}</span><Badge variant={p.stock > 0 ? "secondary" : "destructive"}>{p.stock} {p.unit}</Badge></div>
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><ShoppingCart className="h-12 w-12 mb-3 opacity-20" /><p>Scan a barcode or search to add items</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0"><tr><th className="text-left px-4 py-2 font-medium">Product</th><th className="text-right px-2 py-2 font-medium w-24">Price</th><th className="text-center px-2 py-2 font-medium w-28">Qty</th><th className="text-right px-4 py-2 font-medium w-28">Total</th><th className="w-10"></th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2"><p className="font-medium">{item.productName}</p>{item.gstRate > 0 && <p className="text-xs text-muted-foreground">GST {item.gstRate}%</p>}</td>
                    <td className="text-right px-2 py-2">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-center px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.productId, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.productId, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </td>
                    <td className="text-right px-4 py-2 font-medium">{formatCurrency(item.lineTotal)}</td>
                    <td className="px-2 py-2"><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.productId)}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="w-80 flex flex-col bg-card">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>{formatCurrency(totals.gstTotal)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- {formatCurrency(totals.discount)}</span></div>}
              {totals.roundOff !== 0 && <div className="flex justify-between text-muted-foreground"><span>Round Off</span><span>{totals.roundOff > 0 ? "+" : ""}{formatCurrency(Math.abs(totals.roundOff))}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatCurrency(totals.grandTotal)}</span></div>
            </CardContent>
          </Card>
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Discount (₹)</Label><Input type="number" step="0.01" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Payment</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["CASH", "UPI", "CARD", "CREDIT"] as PaymentMethod[]).map((m) => (
                <Button key={m} variant={paymentMethod === m ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => setPaymentMethod(m)}>{PAYMENT_ICONS[m]}{m}</Button>
              ))}
            </div>
          </div>
          {paymentMethod === "CASH" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Amount Received (₹)</Label>
              <Input type="number" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="h-9" placeholder="0.00" />
              {amountPaid && change >= 0 && <p className="text-sm font-medium text-green-600">Change: {formatCurrency(change)}</p>}
            </div>
          )}
        </div>
        <div className="p-4 border-t space-y-2">
          <Button className="w-full h-12 text-base font-semibold" onClick={handleCheckout} disabled={items.length === 0}>Charge {formatCurrency(totals.grandTotal)}</Button>
          <Button variant="outline" className="w-full" onClick={() => { clearCart(); setAmountPaid(""); setDiscount("0"); }} disabled={items.length === 0}>Clear Cart</Button>
        </div>
      </div>
    </div>
  );
}
