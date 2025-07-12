import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { sendWhatsAppMessage } from "./lib/whatsapp";

const app = new Hono();

// Basic middleware
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

const VERIFY_TOKEN = "butler";

// Routes
// Register webhook with WhatsApp Business
app.get("/", async (c) => {
  console.log(c);
  const {
    "hub.mode": mode,
    "hub.challenge": challenge,
    "hub.verify_token": token,
  } = c.req.query();
  if (mode === "subscribe" && VERIFY_TOKEN === "butler") {
    console.log("WEBHOOK VERIFIED");
    return c.body(challenge);
  } else {
    c.status(403);
    return c.text("Forbidden");
  }
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Receive message
app.post("/", async (c) => {
  console.log("Webhook received");
  console.log(c);

  const body = await c.req.json();
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body;

    if (text) {
      console.log(text);
      sendWhatsAppMessage(from, text);
      // const reminder = await parseReminder(text);
      // console.log(reminder);
      // if (!reminder.remindAt || !reminder.content) {
      //   await sendWhatsAppMessage(
      //     from,
      //     `Apologies young master. I need a clearer directive. Here's what I heard: ${JSON.stringify(reminder)}`,
      //   );
      // } else {
      //   await sendWhatsAppMessage(from, `Understood sir. I will remind you at ${reminder.remindAt}`);
      // }
    }
  }

  return c.text("OK");
});

const port = 3000;
console.log(`Server is running on port ${port}`);

// setInterval(async () => {
//   console.log("Task running at an interval");
// }, 1000);

serve({
  fetch: app.fetch,
  port,
});
