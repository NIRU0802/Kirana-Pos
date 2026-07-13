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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { formatCurrency, rupeesToPaise } from "@/shared/lib/utils";
import { useToastEmitter } from "@/shared/hooks/use-toast";
import {
  Barcode, Trash2, Plus, Minus, CreditCard,
  Banknote, Smartphone, Search, X, MessageCircle, User,
} from "lucide-react";
import type { Product } from "@/features/products/types";
import type { Customer } from "@/features/customers/types";
import type { PaymentMethod } from "@/shared/types";
import type { BillResult } from "@/features/billing/services/billing.service";

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  CASH: <Banknote className="h-4 w-4" />,
  UPI: <Smartphone className="h-4 w-4" />,
  CARD: <CreditCard className="h-4 w-4" />,
  CREDIT: <CreditCard className="h-4 w-4" />,
};

export default function BillingPage() {
  // Product search / barcode
  const [barcodeInput, setBarcodeInput] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastEmitter();

  // Payment
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState("0");

  // Customer
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [customerDropOpen, setCustomerDropOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Store name
  const [storeName, setStoreName] = useState("Our Store");

  // WhatsApp dialog
  const [whatsappDialog, setWhatsappDialog] = useState(false);
  const [lastBill, setLastBill] = useState<BillResult | null>(null);
  const [lastItems, setLastItems] = useState<ReturnType<typeof useCartStore.getState>["items"]>([]);

  const {
    items, paymentMethod, setPaymentMethod, addItem, updateQty,
    removeItem, setDiscount: storeSetDiscount, clearCart, getTotals,
  } = useCartStore();
  const totals = getTotals();
  const change = Math.max(0, (parseFloat(amountPaid) * 100 || 0) - totals.grandTotal);

  // Focus barcode on mount
  useEffect(() => { barcodeRef.current?.focus(); }, []);

  // Load store name
  useEffect(() => {
    ipcInvoke<{ storeName: string }>(IPC_CHANNELS.SETTINGS_GET_ALL)
      .then((s) => { if (s.storeName) setStoreName(s.storeName); })
      .catch(() => {});
  }, []);

  // Load ALL products for suggestions panel
  useEffect(() => {
    ipcInvoke<Product[]>(IPC_CHANNELS.PRODUCT_GET_ALL)
      .then((p) => setAllProducts(p.filter((x) => x.stock > 0)))
      .catch(() => {});
  }, []);

  // Barcode enter
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

  // Name search
  const handleNameSearch = useCallback(async (q: string) => {
    setNameQuery(q);
    if (q.length < 1) { setSearchResults([]); setSearchOpen(false); return; }
    const results = await ipcInvoke<Product[]>(IPC_CHANNELS.PRODUCT_SEARCH, q);
    setSearchResults(results);
    setSearchOpen(results.length > 0);
  }, []);

  // Customer search — by name OR phone
  const handleCustomerSearch = useCallback(async (q: string) => {
    setCustomerQuery(q);
    if (q.length < 1) { setCustomerResults([]); setCustomerDropOpen(false); return; }
    try {
      const results = await ipcInvoke<Customer[]>(IPC_CHANNELS.CUSTOMER_SEARCH, q);
      setCustomerResults(results);
      setCustomerDropOpen(results.length > 0);
    } catch { setCustomerResults([]); }
  }, []);

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustomerQuery(c.name);
    setCustomerDropOpen(false);
    setPaymentMethod("CREDIT");
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerQuery("");
    setPaymentMethod("CASH");
  };

  const addProduct = (p: Product) => {
    if (p.stock <= 0) { toast({ title: "Out of stock", variant: "destructive" }); return; }
    addItem({ productId: p.id, productName: p.name, barcode: p.barcode, unit: p.unit, quantity: 1, unitPrice: p.sellingPrice, costPrice: p.costPrice, gstRate: p.gstRate });
    setNameQuery(""); setSearchResults([]); setSearchOpen(false);
    barcodeRef.current?.focus();
  };

  useEffect(() => { storeSetDiscount(rupeesToPaise(parseFloat(discount) || 0)); }, [discount, storeSetDiscount]);

  const handleCheckout = async () => {
    if (items.length === 0) { toast({ title: "Cart is empty", variant: "destructive" }); return; }
    if (paymentMethod === "CREDIT" && !selectedCustomer) { toast({ title: "Select a khata customer first", variant: "destructive" }); return; }
    const paid = Math.round((parseFloat(amountPaid) || 0) * 100);
    if (paymentMethod === "CASH" && paid < totals.grandTotal) { toast({ title: "Amount paid is less than total", variant: "destructive" }); return; }

    const itemsSnapshot = [...items];
    try {
      const result = await ipcInvoke<BillResult>(IPC_CHANNELS.BILL_CREATE, {
        customerId: selectedCustomer?.id ?? null,
        items: items.map((i) => ({
          productId: i.productId, productName: i.productName, quantity: i.quantity,
          unitPrice: i.unitPrice, costPrice: i.costPrice, gstRate: i.gstRate,
          gstAmount: i.gstAmount, lineTotal: i.lineTotal,
        })),
        subtotal: totals.subtotal, gstTotal: totals.gstTotal, discount: totals.discount,
        roundOff: totals.roundOff, grandTotal: totals.grandTotal,
        amountPaid: paymentMethod === "CASH" ? paid : totals.grandTotal,
        changeDue: paymentMethod === "CASH" ? change : 0,
        paymentMethod,
      });

      toast({ title: `Bill #${result.billNumber} created`, variant: "success" });

      // Show WhatsApp prompt only if khata customer with outstanding balance
      if (result.customerId && result.customerPhone && result.creditBalance && result.creditBalance > 0) {
        setLastBill(result);
        setLastItems(itemsSnapshot);
        setWhatsappDialog(true);
      }

      clearCart(); setAmountPaid(""); setDiscount("0");
      setSelectedCustomer(null); setCustomerQuery("");
      barcodeRef.current?.focus();
    } catch (e) { toast({ title: e instanceof Error ? e.message : "Billing failed", variant: "destructive" }); }
  };

  const handleSendWhatsApp = async () => {
    if (!lastBill?.customerPhone) return;
    try {
      await ipcInvoke(IPC_CHANNELS.WHATSAPP_OPEN, {
        phone: lastBill.customerPhone,
        customerName: lastBill.customerName ?? "Customer",
        billNumber: lastBill.billNumber,
        storeName,
        items: lastItems.map((i) => ({
          productName: i.productName, quantity: i.quantity,
          unitPrice: i.unitPrice, lineTotal: i.lineTotal,
        })),
        grandTotal: lastItems.reduce((s, i) => s + i.lineTotal, 0),
        creditBalance: lastBill.creditBalance ?? 0,
      });
      toast({ title: "WhatsApp opened!", variant: "success" });
      setWhatsappDialog(false);
    } catch (e) {
      toast({ title: "Could not open WhatsApp", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  // Products to show in suggestion panel (when cart is empty or always)
  const suggestedProducts = nameQuery.length > 0 ? searchResults : allProducts.slice(0, 20);

  return (
    <div className="flex h-full">
      {/* ── LEFT: Cart + Search ── */}
      <div className="flex-1 flex flex-col border-r min-w-0">
        {/* Search bar */}
        <div className="p-3 border-b space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={barcodeRef}
                className="pl-9"
                placeholder="Scan barcode…"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBarcodeEnter()}
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search product by name…"
                value={nameQuery}
                onChange={(e) => handleNameSearch(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
              />
            </div>
          </div>
        </div>

        {/* Search dropdown results */}
        {searchOpen && searchResults.length > 0 && (
          <div className="border-b max-h-44 overflow-y-auto bg-background shadow z-10">
            {searchResults.map((p) => (
              <button key={p.id}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-accent text-left text-sm border-b last:border-0"
                onClick={() => addProduct(p)}>
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{p.barcode}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{formatCurrency(p.sellingPrice)}</span>
                  <Badge variant={p.stock > 5 ? "secondary" : p.stock > 0 ? "warning" : "destructive"}>{p.stock} {p.unit}</Badge>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Cart items OR Product Suggestions */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            // Show product suggestions when cart is empty
            <div>
              <p className="text-xs text-muted-foreground px-4 pt-3 pb-1 font-medium uppercase tracking-wide">
                {nameQuery ? "Search Results" : "Quick Add — Available Products"}
              </p>
              <div className="grid grid-cols-2 gap-2 p-3">
                {suggestedProducts.map((p) => (
                  <button key={p.id}
                    onClick={() => addProduct(p)}
                    className="text-left rounded-lg border p-3 hover:bg-accent hover:border-primary transition-colors">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-primary font-semibold text-sm mt-0.5">{formatCurrency(p.sellingPrice)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Stock: {p.stock} {p.unit}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Cart table
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Product</th>
                  <th className="text-right px-2 py-2 font-medium w-24">Price</th>
                  <th className="text-center px-2 py-2 font-medium w-28">Qty</th>
                  <th className="text-right px-4 py-2 font-medium w-28">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <p className="font-medium">{item.productName}</p>
                      {item.gstRate > 0 && <p className="text-xs text-muted-foreground">GST {item.gstRate}%</p>}
                    </td>
                    <td className="text-right px-2 py-2">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-center px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.productId, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.productId, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </td>
                    <td className="text-right px-4 py-2 font-medium">{formatCurrency(item.lineTotal)}</td>
                    <td className="px-2 py-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.productId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick-add bar when cart has items */}
        {items.length > 0 && (
          <div className="border-t p-2">
            <p className="text-xs text-muted-foreground mb-1.5 px-1">Quick add more:</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {allProducts.slice(0, 12).map((p) => (
                <button key={p.id}
                  onClick={() => addProduct(p)}
                  className="shrink-0 rounded-md border px-3 py-1.5 text-xs hover:bg-accent hover:border-primary transition-colors text-left">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-primary ml-1">{formatCurrency(p.sellingPrice)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Payment sidebar ── */}
      <div className="w-80 flex flex-col bg-card shrink-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* Khata Customer Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Khata Customer (optional)
            </Label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-green-50 dark:bg-green-900/20 border-green-300">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">{selectedCustomer.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {selectedCustomer.phone ?? "No phone"} · Balance: {formatCurrency(selectedCustomer.creditBalance)}
                  </p>
                </div>
                <button onClick={clearCustomer} className="text-green-600 hover:text-green-800 ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-9 text-sm"
                  placeholder="Name or phone number…"
                  value={customerQuery}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  onBlur={() => setTimeout(() => setCustomerDropOpen(false), 150)}
                />
                {customerDropOpen && customerResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-44 overflow-y-auto">
                    {customerResults.map((c) => (
                      <button key={c.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent border-b last:border-0"
                        onMouseDown={() => selectCustomer(c)}>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.phone ?? "No phone"} ·{" "}
                          <span className={c.creditBalance > 0 ? "text-red-600 font-semibold" : ""}>
                            {c.creditBalance > 0 ? `Owes ${formatCurrency(c.creditBalance)}` : "No balance"}
                          </span>
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>{formatCurrency(totals.gstTotal)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- {formatCurrency(totals.discount)}</span></div>}
              {totals.roundOff !== 0 && <div className="flex justify-between text-muted-foreground"><span>Round Off</span><span>{totals.roundOff > 0 ? "+" : ""}{formatCurrency(Math.abs(totals.roundOff))}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatCurrency(totals.grandTotal)}</span></div>
            </CardContent>
          </Card>

          {/* Discount */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Discount (₹)</Label>
            <Input type="number" step="0.01" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-9" />
          </div>

          {/* Payment method */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Payment</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["CASH", "UPI", "CARD", "CREDIT"] as PaymentMethod[]).map((m) => (
                <Button key={m} variant={paymentMethod === m ? "default" : "outline"} size="sm" className="gap-1.5"
                  onClick={() => setPaymentMethod(m)}>
                  {PAYMENT_ICONS[m]}{m}
                </Button>
              ))}
            </div>
          </div>

          {/* Cash received */}
          {paymentMethod === "CASH" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Amount Received (₹)</Label>
              <Input type="number" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="h-9" placeholder="0.00" />
              {amountPaid && change >= 0 && <p className="text-sm font-medium text-green-600">Change: {formatCurrency(change)}</p>}
            </div>
          )}

          {/* Warnings */}
          {paymentMethod === "CREDIT" && !selectedCustomer && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-md px-3 py-2 border border-orange-200">
              ⚠️ Select a Khata customer above to use CREDIT payment.
            </p>
          )}
          {selectedCustomer && selectedCustomer.creditBalance > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              📒 Current Khata: <span className="font-bold">{formatCurrency(selectedCustomer.creditBalance)}</span>
            </div>
          )}
        </div>

        {/* Checkout buttons */}
        <div className="p-4 border-t space-y-2">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleCheckout}
            disabled={items.length === 0 || (paymentMethod === "CREDIT" && !selectedCustomer)}
          >
            Charge {formatCurrency(totals.grandTotal)}
          </Button>
          <Button variant="outline" className="w-full"
            onClick={() => { clearCart(); setAmountPaid(""); setDiscount("0"); setSelectedCustomer(null); setCustomerQuery(""); }}
            disabled={items.length === 0}>
            Clear Cart
          </Button>
        </div>
      </div>

      {/* ── WhatsApp Dialog ── */}
      <Dialog open={whatsappDialog} onOpenChange={setWhatsappDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Send Bill on WhatsApp?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Customer has an outstanding Khata balance. Send them this bill + balance reminder.
            </p>
            {lastBill && (
              <div className="rounded-md bg-muted px-4 py-3 space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> <span className="font-semibold">{lastBill.customerName}</span></p>
                <p><span className="text-muted-foreground">Phone:</span> {lastBill.customerPhone}</p>
                <p><span className="text-muted-foreground">This Bill:</span> <span className="font-semibold">{formatCurrency(lastItems.reduce((s, i) => s + i.lineTotal, 0))}</span></p>
                <p><span className="text-muted-foreground">Total Khata Remaining:</span> <span className="font-bold text-red-600">{formatCurrency(lastBill.creditBalance ?? 0)}</span></p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2" onClick={handleSendWhatsApp}>
                <MessageCircle className="h-4 w-4" /> Send WhatsApp
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setWhatsappDialog(false)}>Skip</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}