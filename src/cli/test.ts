import { sendWhatsAppMessage } from "../lib/whatsapp";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: npx tsx src/cli/test.ts <phone_number> <message>");
    console.error(
      'Example: npx tsx src/cli/test.ts "1234567890" "Hello from CLI!"'
    );
    process.exit(1);
  }

  const [phoneNumber, message] = args;

  try {
    await sendWhatsAppMessage(phoneNumber, message);
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message:", error);
    process.exit(1);
  }
}

main();
