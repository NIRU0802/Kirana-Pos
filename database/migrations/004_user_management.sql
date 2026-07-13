-- Reset admin to a known working password
UPDATE User SET passwordHash = '31e05f37b9016ada51fc7d79e73db1b0:cb29d759d67c1df0bd8ca52bebf78ddfc5f72369716691da8162d13e76cdc2fa', updatedAt = datetime('now') WHERE username = 'admin';

-- Seed manager + 3 cashiers with real, working password hashes
INSERT OR IGNORE INTO User(username, passwordHash, role, createdAt, updatedAt) VALUES
  ('manager', 'fc701411790ccc29ff73eb9739f50cbe:64c2831d7a003d5b6af0b24512f7683c951c1f62971c63f19716977171045c9a', 'manager', datetime('now'), datetime('now')),
  ('cashier1', '345ff167ffe9a95d6d833cad6691193d:0d33d1f7e3bed19099db75c6293cddf5e628e1f968aada736cdce4e12d9fdacb', 'cashier', datetime('now'), datetime('now')),
  ('cashier2', '35eb3f9257ef8c872c415ca4ed8d7a2f:489c3c25b328f979d147c4e61517ecd17445290d9b844252fcb2fd693d7952e1', 'cashier', datetime('now'), datetime('now')),
  ('cashier3', 'aeb6d3d1e0fc2cc93dd3c1d08738bdc3:157f515a6e4f59653cf29f9e18c98fbb4559136543550ee93a571edac64bdb87', 'cashier', datetime('now'), datetime('now'));
