export interface DailySalesRow { date:string; billCount:number; subtotal:number; gstTotal:number; discount:number; grandTotal:number; cashTotal:number; upiTotal:number; creditTotal:number; cardTotal:number; }
export interface ProductSalesRow { productId:number; productName:string; unit:string; quantitySold:number; revenue:number; cost:number; profit:number; }
export interface GstRow { gstRate:number; taxableAmount:number; gstAmount:number; }
export interface StockValuationRow { productId:number; productName:string; unit:string; quantity:number; costPrice:number; sellingPrice:number; stockValue:number; retailValue:number; }
