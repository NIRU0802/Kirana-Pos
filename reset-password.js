const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");
const { app } = require("electron");

function hashPassword(password, salt) {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}
function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}
function createPasswordHash(password) {
  const salt = generateSalt();
  return `${salt}:${hashPassword(password, salt)}`;
}

app.whenReady().then(() => {
  const base = app.getPath("appData");
  const dbPath = path.join(base, "KiranaPOS", "database", "kirana.db");
  const db = new Database(dbPath);

  const newHash = createPasswordHash("admin123");
  db.prepare("UPDATE User SET passwordHash = ? WHERE username = ?").run(newHash, "admin");

  console.log("Password reset. New hash:", newHash);
  const check = db.prepare("SELECT id, username, passwordHash FROM User WHERE username = ?").get("admin");
  console.log("Verify:", JSON.stringify(check, null, 2));

  app.quit();
});
