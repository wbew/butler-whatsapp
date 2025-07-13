// const VERIFY_TOKEN = "butler";
// const openai = new OpenAI();
// const app = new Hono();

// const ReminderSchema = z.object({
//   content: z.string().nullish(),
//   remindAt: z.string().datetime().nullish(),
// });

const PHONE_NUMBER_ID = "705847639280522";
const ACCESS_TOKEN =
  "EAAZA7HzFZBBgEBPCJaiOHhZBmbXHN3pmUUC7DrAFFawEQvZBQ2j84irl26jghpyAZAmDDlXOlsxIyteCXBCqce99ij8Cf78HAWsu1ZB8yy0eNO3t5ZCwmTeKsINfMfma9ZCHXB47qz9asgRVMjzXkkXJZBJnp2C79wCmZAl8ZCZBOwhZCRZBNPjnQczAeNjCcoR85lYfqNIAZDZD";

export const sendWhatsAppMessage = async (to: string, text: string) => {
  console.log("Sending WhatsApp message", { to, text });
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );
  const responseData = await response.json();
  console.log("WhatsApp API response:", responseData);
};

// export async function parseReminder(text: string) {
//   const completion = await openai.chat.completions.create({
//     messages: [
//       {
//         role: "system",
//         content:
//           `You are a helpful assistant that extracts reminders from user messages. Return a JSON object with "reminder" (the task) and "remindAt" (ISO 8601 datetime).`,
//       },
//       {
//         role: "user",
//         content: text,
//       },
//     ],
//     response_format: {
//       type: "json_schema",
//       json_schema: {
//         name: "reminder",
//         strict: true,
//         schema: {
//           "type": "object",
//           "properties": {
//             "content": {
//               "type": ["string", "null"],
//               "description": "The task or event to be reminded about.",
//             },
//             "remindAt": {
//               "type": ["string", "null"],
//               "format": "date-time",
//               "description": "The ISO 8601 datetime when the reminder should be sent.",
//             },
//           },
//           "required": ["content", "remindAt"],
//           "additionalProperties": false,
//         },
//       },
//     },
//   });

//   console.log(completion);
//   const reminder = JsonStringToReminder.safeParse(completion.choices[0].message.content).data;
//   console.log("Parsed", completion);
//   return reminder;
// }

// const JsonStringToReminder = z
//   .string()
//   .transform((str, ctx) => {
//     try {
//       return JSON.parse(str);
//     } catch (e) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Invalid JSON",
//       });
//       return z.NEVER;
//     }
//   })
//   .pipe(ReminderSchema);

// export default app.fetch;
