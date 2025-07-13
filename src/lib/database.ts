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

export type Message = {
  id: number;
  user_id: string;
  content: string;
  timestamp: string;
  created_at: string;
};

export type InsertMessageResult = {
  id: number;
  user_id: string;
  content: string;
  timestamp: string;
  created_at: string;
};

// Database schema initialization
export function initializeDatabase(): Database.Database {
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

export const insertMessage = (
  db: Database.Database,
  message: string,
  userId: string
): InsertMessageResult => {
  try {
    const stmt = db.prepare(
      `INSERT INTO messages (user_id, content) VALUES (?, ?) RETURNING *`
    );
    const result = stmt.get(userId, message) as InsertMessageResult;
    return result;
  } catch (error) {
    throw new Error(
      `Failed to insert message: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getMessages = (
  db: Database.Database,
  limit: number = 50
): Message[] => {
  try {
    const stmt = db.prepare(
      `SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?`
    );
    const messages = stmt.all(limit) as Message[];
    return messages;
  } catch (error) {
    throw new Error(
      `Failed to get messages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export type Reminder = {
  id: number;
  user_id: string;
  content: string;
  remind_at: string;
  completed: boolean;
  created_at: string;
};

export type InsertReminderData = {
  content: string;
  remind_at: string;
};

export const insertReminder = (
  db: Database.Database,
  userId: string,
  reminder: InsertReminderData
): Reminder => {
  try {
    const stmt = db.prepare(
      `INSERT INTO reminders (user_id, content, remind_at) VALUES (?, ?, ?) RETURNING *`
    );
    const result = stmt.get(
      userId,
      reminder.content,
      reminder.remind_at
    ) as Reminder;
    return result;
  } catch (error) {
    throw new Error(
      `Failed to insert reminder: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getReadyReminders = (db: Database.Database): Reminder[] => {
  const nowUtc = new Date().toISOString(); // always UTC
  const stmt = db.prepare(
    "SELECT * FROM reminders WHERE remind_at <= ? AND completed IS FALSE"
  );
  const reminders = stmt.all(nowUtc) as Reminder[];
  return reminders;
};

export const getPendingReminders = (db: Database.Database): Reminder[] => {
  try {
    const stmt = db.prepare(
      "SELECT * FROM reminders WHERE completed IS FALSE ORDER BY remind_at ASC"
    );
    const reminders = stmt.all() as Reminder[];
    return reminders;
  } catch (error) {
    throw new Error(
      `Failed to get pending reminders: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const markReminderAsCompleted = (db: Database.Database, id: number) => {
  const stmt = db.prepare("UPDATE reminders SET completed = TRUE WHERE id = ?");
  stmt.run(id);
};
