const path = require("path");
const Database = require("better-sqlite3");
const { app } = require("electron");

app.whenReady().then(() => {
  const base = app.getPath("appData");
  const dbPath = path.join(base, "KiranaPOS", "database", "kirana.db");
  const db = new Database(dbPath);
  const users = db.prepare("SELECT id, username, role, isActive, passwordHash FROM User").all();
  console.log("Users:", JSON.stringify(users, null, 2));
  app.quit();
});
