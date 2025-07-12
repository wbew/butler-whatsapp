import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Environment-based database path configuration
function getDatabasePath(): string {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // Render persistent disk mount (configure this in Render dashboard)
    return "/var/data/butler-production.db";
  } else {
    // Local development
    const dbPath = path.join(process.cwd(), "data", "butler-local.db");

    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return dbPath;
  }
}

// Database schema initialization
function initializeDatabase(): Database.Database {
  // Create database connection
  const dbPath = getDatabasePath();
  const db = new Database(dbPath);

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create reminders table (for future use)
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      remind_at DATETIME NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
  `);

  console.log("Database schema initialized successfully");
  return db;
}
