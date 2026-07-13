ALTER TABLE Product ADD COLUMN expiryDate TEXT;
ALTER TABLE Product ADD COLUMN expiryAlertDays INTEGER NOT NULL DEFAULT 30;

CREATE INDEX IF NOT EXISTS idx_product_expiry ON Product(expiryDate);