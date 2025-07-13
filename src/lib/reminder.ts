import Database from "better-sqlite3";
import { sendWhatsAppMessage } from "./whatsapp";
import { getReadyReminders, markReminderAsCompleted } from "./database";

export const handleReminders = (db: Database.Database) => {
  const reminders = getReadyReminders(db);

  reminders.forEach((reminder) => {
    console.log("Sending reminder", reminder);
    sendWhatsAppMessage(reminder.user_id, reminder.content);
    markReminderAsCompleted(db, reminder.id);
  });
};
