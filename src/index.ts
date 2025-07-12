import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

// Basic middleware
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

// Routes
app.get("/", (c) => {
  return c.json({ message: "Hello from Butler WhatsApp API!" });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.route(
  "/api",
  new Hono().get("/status", (c) => {
    return c.json({ api: "running", version: "1.0.0" });
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
