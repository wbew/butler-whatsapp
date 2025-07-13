import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { sendWhatsAppMessage } from "./lib/whatsapp";
import { AI } from "./lib/ai";

import "dotenv/config";
import {
  getMessages,
  initializeDatabase,
  insertMessage,
  insertReminder,
  getPendingReminders,
  Message,
} from "./lib/database";
import Database from "better-sqlite3";
import OpenAI from "openai";
import { handleReminders } from "./lib/reminder";

const WHATSAPP_VERIFY_WEBHOOK_TOKEN = "butler";

function main() {
  const ai = new AI();
  const db = initializeDatabase();
  const app = new Hono();

  // Routes
  // Register webhook with WhatsApp Business
  app.get("/", async (c) => {
    console.log("Registering webhook");
    const {
      "hub.mode": mode,
      "hub.challenge": challenge,
      "hub.verify_token": token,
    } = c.req.query();
    if (mode === "subscribe" && WHATSAPP_VERIFY_WEBHOOK_TOKEN === "butler") {
      console.log("WEBHOOK VERIFIED");
      return c.body(challenge);
    } else {
      c.status(403);
      return c.text("Forbidden");
    }
  });

  // Receive message
  app.post("/", async (c) => {
    console.log("Webhook received");

    const body = await c.req.json();
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body;

      if (text) {
        handleIncomingMessage(from, db, ai, text);
      }
    }

    return c.text("OK");
  });

  // Get all pending reminders
  app.get("/reminders", async (c) => {
    try {
      const reminders = getPendingReminders(db);
      return c.json({ reminders });
    } catch (error) {
      console.error("Error fetching reminders:", error);
      c.status(500);
      return c.json({ error: "Failed to fetch reminders" });
    }
  });

  const port = 3000;
  console.log(`Server is running on port ${port}`);

  setInterval(async () => {
    handleReminders(db);
  }, 1000);

  serve({
    fetch: app.fetch,
    port,
  });
}

export const handleIncomingMessage = async (
  userId: string,
  db: Database.Database,
  ai: AI,
  message: string
) => {
  insertMessage(db, message, userId);
  const messages = getMessages(db, 50);
  const analysis = await ai.analyzeMessage({
    text: message,
    chatHistory: formatMessagesAsChatHistory(messages),
  });

  console.log("Analysis", analysis);
  insertMessage(db, analysis.response, "butler");
  analysis.reminders.forEach((reminder) => {
    insertReminder(db, userId, {
      content: reminder.content,
      remind_at: reminder.remindAt,
    });
  });

  sendWhatsAppMessage(userId, analysis.response);
};

const formatMessagesAsChatHistory = (
  messages: Message[]
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  return messages.map((message) => ({
    role: message.user_id !== "butler" ? "user" : "assistant",
    content: message.content,
  }));
};

main();
