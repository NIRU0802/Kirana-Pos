# KiranaPOS

Offline-first Windows desktop POS and store management system for kirana (Indian convenience) stores.

## Stack
Electron · Next.js App Router · TypeScript · SQLite (WAL) · better-sqlite3 · Zustand · Tailwind CSS · shadcn/ui · React Hook Form · Zod

## Setup (on your local machine)

```bash
# 1. Install dependencies
npm install

# 2. Run in development (starts Next.js + Electron together)
npm run dev

# 3. Build a Windows installer
npm run dist:win
```

> better-sqlite3 is a native module. If `npm install` fails on it, run:
> `npm install --build-from-source` or ensure Python + a C++ build toolchain (Visual Studio Build Tools on Windows) is installed.

## Default Login
- **Username:** `admin`
- **Password:** `admin123`

Change the password immediately after first login (Settings will get a "change password" flow — currently change via the `User` table or extend `/settings`).

## Modules & Routes
| Module | Route |
|---|---|
| Billing POS | `/billing` |
| Products | `/products` |
| Categories | `/categories` |
| Inventory | `/inventory` |
| Customers | `/customers` |
| Khata / Udhar (credit ledger) | `/khata` |
| Reports (sales, GST, P&L) | `/reports` |
| Audit Logs | `/audit` |
| Backup & Restore | `/backup` |
| Settings | `/settings` |

## Architecture
```
Renderer (Next.js, static export)
   │  window.electronAPI.invoke(channel, ...)
   ▼
contextBridge (preload, contextIsolation: true, sandbox: true)
   │
   ▼
ipcMain handlers (electron/ipc/*.handlers.ts)
   │
   ▼
Services (features/*/services) — business logic, validation
   │
   ▼
Repositories (features/*/repositories) — raw SQL via better-sqlite3
   │
   ▼
SQLite (WAL mode) — single file, offline-first
```

### Key engineering decisions
- **Money as integer paise** everywhere in the DB and IPC layer; UI converts to/from rupees only at the input/display boundary (`paiseToRupees` / `rupeesToPaise`).
- **contextIsolation + sandbox + no nodeIntegration** — renderer never touches Node/Electron APIs directly, only the typed `window.electronAPI.invoke(...)` bridge.
- **Transactional billing** — stock deduction, bill creation, and credit-ledger updates happen inside one SQLite transaction (`withTransaction`) so a crash can't leave half a sale.
- **Audit logging** — `BaseRepository.audit()` writes before/after JSON snapshots to `AuditLog` for every product/category/customer/bill mutation.
- **Stock movements** — every stock change (sale, purchase, adjustment, damage, refund) is logged to `StockMovement`, and `Stock.quantity` is updated atomically via `ON CONFLICT`.

## Project Structure
```
electron/           Main process, preload bridge, IPC handlers
database/            SQLite client, migrations (raw SQL), base repository, seeds
features/<name>/     types | schemas (Zod) | services | repositories | components | hooks | stores
shared/               UI primitives (shadcn-style), layout, hooks, lib, Zustand app store, shared types
app/                  Next.js App Router pages (login, management group, billing POS)
tests/unit            Vitest unit tests (pure logic: utils, cart store)
tests/e2e             Playwright end-to-end tests
```

## Scripts
```bash
npm run dev            # Next.js dev server + Electron together
npm run build           # Next static export + compile Electron main/preload
npm run dist:win        # Build Windows NSIS installer
npm run typecheck       # tsc --noEmit (renderer)
npm run typecheck:electron
npm run lint             # ESLint
npm run test             # Vitest unit tests
npm run test:e2e         # Playwright
npm run db:seed          # Insert sample products/categories
npm run format            # Prettier
```

## Database location
At runtime the SQLite file lives outside the install directory so updates don't wipe data:
- Windows: `%APPDATA%\KiranaPOS\database\kirana.db`
- Backups: `%APPDATA%\KiranaPOS\backups\*.db`

## Security checklist
- [x] `contextIsolation: true`
- [x] `nodeIntegration: false`
- [x] `sandbox: true`
- [x] No direct Node API access from renderer
- [x] All IPC channels whitelisted via `IPC_CHANNELS` const
- [x] `will-navigate` / `setWindowOpenHandler` locked down in main process
