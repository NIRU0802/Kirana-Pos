import { getDatabase } from "../client";
import { runMigrations } from "../migrate";

const db = getDatabase();
runMigrations(db);

const products = [
  { barcode: "8901030870018", name: "Tata Salt 1kg", categoryId: 1, unit: "PKT", costPrice: 1800, sellingPrice: 2000, mrp: 2200, gstRate: 0 },
  { barcode: "8901030000018", name: "Amul Butter 100g", categoryId: 2, unit: "PKT", costPrice: 4800, sellingPrice: 5200, mrp: 5500, gstRate: 5 },
  { barcode: "8906006460025", name: "Parle-G Biscuits 70g", categoryId: 4, unit: "PKT", costPrice: 500, sellingPrice: 600, mrp: 700, gstRate: 5 },
  { barcode: "8901063023536", name: "Coca Cola 750ml", categoryId: 3, unit: "BTL", costPrice: 3800, sellingPrice: 4000, mrp: 4500, gstRate: 28 },
  { barcode: "8901520100046", name: "Dettol Soap 75g", categoryId: 5, unit: "PCS", costPrice: 3500, sellingPrice: 3800, mrp: 4200, gstRate: 18 },
];

const now = new Date().toISOString();
for (const p of products) {
  const r = db.prepare(
    `INSERT OR IGNORE INTO Product(barcode,name,categoryId,unit,costPrice,sellingPrice,mrp,gstRate,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(p.barcode, p.name, p.categoryId, p.unit, p.costPrice, p.sellingPrice, p.mrp, p.gstRate, now, now);
  if (r.lastInsertRowid) {
    db.prepare("INSERT OR IGNORE INTO Stock(productId,quantity,updatedAt) VALUES (?,?,?)").run(r.lastInsertRowid, 100, now);
  }
}
console.log("✅ Seed complete");
