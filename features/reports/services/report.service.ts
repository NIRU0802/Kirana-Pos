import { getDatabase } from "../../../database/client";
import type { DailySalesRow, ProductSalesRow, GstRow, StockValuationRow } from "../types";

const db = () => getDatabase();

export const reportService = {
  dailySales(from: string, to: string): DailySalesRow[] {
    return db().prepare<[string,string], DailySalesRow>(
      `SELECT date(b.createdAt) AS date, COUNT(*) AS billCount,
        SUM(b.subtotal) AS subtotal, SUM(b.gstTotal) AS gstTotal, SUM(b.discount) AS discount, SUM(b.grandTotal) AS grandTotal,
        SUM(CASE WHEN b.paymentMethod='CASH' THEN b.grandTotal ELSE 0 END) AS cashTotal,
        SUM(CASE WHEN b.paymentMethod='UPI' THEN b.grandTotal ELSE 0 END) AS upiTotal,
        SUM(CASE WHEN b.paymentMethod='CREDIT' THEN b.grandTotal ELSE 0 END) AS creditTotal,
        SUM(CASE WHEN b.paymentMethod='CARD' THEN b.grandTotal ELSE 0 END) AS cardTotal
       FROM Bill b WHERE b.status!='REFUNDED' AND date(b.createdAt) BETWEEN date(?) AND date(?)
       GROUP BY date(b.createdAt) ORDER BY date(b.createdAt) DESC`
    ).all(from, to);
  },
  productSales(from: string, to: string): ProductSalesRow[] {
    return db().prepare<[string,string], ProductSalesRow>(
      `SELECT bi.productId, bi.productName, p.unit, SUM(bi.quantity) AS quantitySold,
        SUM(bi.lineTotal) AS revenue, SUM(bi.quantity*bi.costPrice) AS cost,
        SUM(bi.lineTotal - bi.quantity*bi.costPrice) AS profit
       FROM BillItem bi JOIN Bill b ON b.id=bi.billId JOIN Product p ON p.id=bi.productId
       WHERE b.status!='REFUNDED' AND date(b.createdAt) BETWEEN date(?) AND date(?)
       GROUP BY bi.productId ORDER BY revenue DESC`
    ).all(from, to);
  },
  gstSummary(from: string, to: string): GstRow[] {
    return db().prepare<[string,string], GstRow>(
      `SELECT bi.gstRate, SUM(bi.quantity*bi.unitPrice) AS taxableAmount, SUM(bi.gstAmount) AS gstAmount
       FROM BillItem bi JOIN Bill b ON b.id=bi.billId
       WHERE b.status!='REFUNDED' AND date(b.createdAt) BETWEEN date(?) AND date(?)
       GROUP BY bi.gstRate ORDER BY bi.gstRate`
    ).all(from, to);
  },
  stockValuation(): StockValuationRow[] {
    return db().prepare<[], StockValuationRow>(
      `SELECT p.id AS productId, p.name AS productName, p.unit, COALESCE(s.quantity,0) AS quantity,
        p.costPrice, p.sellingPrice, COALESCE(s.quantity,0)*p.costPrice AS stockValue, COALESCE(s.quantity,0)*p.sellingPrice AS retailValue
       FROM Product p LEFT JOIN Stock s ON s.productId=p.id WHERE p.isActive=1 ORDER BY stockValue DESC`
    ).all();
  },
  profitLoss(from: string, to: string) {
    const sales = db().prepare<[string,string],{revenue:number;cost:number}>(
      `SELECT SUM(bi.lineTotal) AS revenue, SUM(bi.quantity*bi.costPrice) AS cost
       FROM Bill b JOIN BillItem bi ON bi.billId=b.id
       WHERE b.status!='REFUNDED' AND date(b.createdAt) BETWEEN date(?) AND date(?)`
    ).get(from, to);
    const refunds = db().prepare<[string,string],{total:number}>(
      `SELECT COALESCE(SUM(amount),0) AS total FROM Refund WHERE date(createdAt) BETWEEN date(?) AND date(?)`
    ).get(from, to);
    const revenue = sales?.revenue ?? 0, cost = sales?.cost ?? 0, refundTotal = refunds?.total ?? 0;
    return { revenue, cost, grossProfit: revenue - cost, refunds: refundTotal, netProfit: revenue - cost - refundTotal, margin: revenue > 0 ? ((revenue-cost)/revenue)*100 : 0 };
  },
};
