PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'cashier',
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS Category (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS Product (
  id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT UNIQUE, name TEXT NOT NULL,
  description TEXT, categoryId INTEGER REFERENCES Category(id),
  unit TEXT NOT NULL DEFAULT 'PCS', costPrice INTEGER NOT NULL DEFAULT 0,
  sellingPrice INTEGER NOT NULL, mrp INTEGER NOT NULL, gstRate INTEGER NOT NULL DEFAULT 0,
  hsnCode TEXT, isActive INTEGER NOT NULL DEFAULT 1, lowStockAlert INTEGER NOT NULL DEFAULT 10,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_product_barcode ON Product(barcode);
CREATE INDEX IF NOT EXISTS idx_product_name ON Product(name);
CREATE TABLE IF NOT EXISTS Stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL UNIQUE REFERENCES Product(id),
  quantity INTEGER NOT NULL DEFAULT 0, updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS StockMovement (
  id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL REFERENCES Product(id),
  type TEXT NOT NULL, quantity INTEGER NOT NULL, costPrice INTEGER NOT NULL DEFAULT 0,
  referenceId INTEGER, note TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), createdBy TEXT NOT NULL DEFAULT 'system'
);
CREATE INDEX IF NOT EXISTS idx_sm_product ON StockMovement(productId);
CREATE TABLE IF NOT EXISTS Customer (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT UNIQUE,
  address TEXT, creditLimit INTEGER NOT NULL DEFAULT 0, creditBalance INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON Customer(phone);
CREATE TABLE IF NOT EXISTS Bill (
  id INTEGER PRIMARY KEY AUTOINCREMENT, billNumber TEXT NOT NULL UNIQUE,
  customerId INTEGER REFERENCES Customer(id), status TEXT NOT NULL DEFAULT 'COMPLETED',
  subtotal INTEGER NOT NULL, gstTotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0,
  roundOff INTEGER NOT NULL DEFAULT 0, grandTotal INTEGER NOT NULL,
  amountPaid INTEGER NOT NULL, changeDue INTEGER NOT NULL DEFAULT 0,
  paymentMethod TEXT NOT NULL, note TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  createdBy TEXT NOT NULL DEFAULT 'system'
);
CREATE INDEX IF NOT EXISTS idx_bill_number ON Bill(billNumber);
CREATE INDEX IF NOT EXISTS idx_bill_created ON Bill(createdAt);
CREATE TABLE IF NOT EXISTS BillItem (
  id INTEGER PRIMARY KEY AUTOINCREMENT, billId INTEGER NOT NULL REFERENCES Bill(id),
  productId INTEGER NOT NULL REFERENCES Product(id), productName TEXT NOT NULL,
  quantity INTEGER NOT NULL, unitPrice INTEGER NOT NULL, costPrice INTEGER NOT NULL,
  gstRate INTEGER NOT NULL, gstAmount INTEGER NOT NULL, lineTotal INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bi_bill ON BillItem(billId);
CREATE TABLE IF NOT EXISTS Refund (
  id INTEGER PRIMARY KEY AUTOINCREMENT, billId INTEGER NOT NULL REFERENCES Bill(id),
  amount INTEGER NOT NULL, reason TEXT NOT NULL, refundedBy TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS CreditLedger (
  id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL REFERENCES Customer(id),
  type TEXT NOT NULL, amount INTEGER NOT NULL, billId INTEGER, note TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cl_customer ON CreditLedger(customerId);
CREATE TABLE IF NOT EXISTS Settings (
  key TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL, updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS AuditLog (
  id INTEGER PRIMARY KEY AUTOINCREMENT, "table" TEXT NOT NULL, action TEXT NOT NULL,
  recordId INTEGER NOT NULL, oldData TEXT, newData TEXT,
  createdBy TEXT NOT NULL DEFAULT 'system', createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_table ON AuditLog("table", recordId);
CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL UNIQUE,
  appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default admin (password: admin123)
INSERT OR IGNORE INTO User(username, passwordHash, role) VALUES
  ('admin', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3:hashed', 'admin');

INSERT OR IGNORE INTO Settings(key, value) VALUES
  ('storeName','My Kirana Store'),('storeAddress',''),('storePhone',''),
  ('storeGstin',''),('currency','INR'),('billPrefix','INV'),('billCounter','1'),
  ('taxIncluded','false'),('printReceiptAuto','true'),('theme','light'),
  ('printerName',''),('printerWidth','80');

INSERT OR IGNORE INTO Category(name) VALUES ('Groceries'),('Dairy'),('Beverages'),('Snacks'),('Personal Care'),('Household');
