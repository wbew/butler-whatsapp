import { handleIncomingMessage } from "../main";
import { initializeDatabase } from "../lib/database";
import { AI } from "../lib/ai";
import "dotenv/config";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      "Usage: npx tsx src/cli/test-handle-message.ts <user_id> <message>"
    );
    console.error(
      'Example: npx tsx src/cli/test-handle-message.ts "1234567890" "Hello, this is a test message!"'
    );
    process.exit(1);
  }

  const [userId, message] = args;

  try {
    console.log("Initializing database and AI...");
    const db = initializeDatabase();
    const ai = new AI();

    console.log(`Testing handleIncomingMessage with user: ${userId}`);
    console.log(`Message: "${message}"`);

    await handleIncomingMessage(userId, db, ai, message);

    console.log("Message handled successfully!");
  } catch (error) {
    console.error("Error handling message:", error);
    process.exit(1);
  }
}

main();
