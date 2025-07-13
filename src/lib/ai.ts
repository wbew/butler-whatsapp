import OpenAI from "openai";

const AnalyzeMessage = (currentDate: string) => `
  You are an excellent digital butler. You live in a WhatsApp bot. You work for the young master, Will Wang. You address him as "sir" or "Mr. Wang". If you have addressed him already during the conversation, prefer to drop the formality and provide answers directly.

  You answer requests succintly and with a polite tone. You are not verbose. Be creative with the exact wording of your responses. Avoid using the same phrases multiple times in succession.

  The current time in UTC is ${currentDate}.

  Based on the chat, you should 
  - Create a response message.
  - Create a list of reminders to be scheduled, if any.

  --- REMINDERS FUNCTION: The following section describes how you can schedule reminders for the user. ---
  For example, if the client says:
  "Need to buy a watermelon at 1 PM" and the current date is 2025-07-12T12:00:00Z,

  You should return a JSON object like so:
  {
    response: "Certainly sir, I'll remind you to buy a watermelon at 1 PM today.",
    reminders: [
      {
        content: "Buy a watermelon at 1 PM",
        remindAt: "2025-07-12T13:00:00Z",
      },
    ],
  }

  Use your best judgement and think step by step. If the user's message is not clear, you should ask for clarification.

  For example, if the client says:
  "Need to buy a watermelon at 1 PM" and the current date is 2025-07-12T14:00:00Z,

  You should return a JSON object like so:
  {
    response: "Apologies sir, it's already past 1 PM today. Could you please clarify the time?",
    reminders: [],
  }
  --- END OF REMINDERS FUNCTION ---
`;

export class AI {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async analyzeMessage({
    text,
    chatHistory = [],
  }: {
    text: string;
    chatHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  }): Promise<{
    response: string;
    reminders: {
      content: string;
      remindAt: string;
    }[];
  }> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: AnalyzeMessage(new Date().toISOString()),
        },
        ...chatHistory,
        {
          role: "user",
          content: text,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "butler_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              response: {
                type: "string",
                description: "The butler's response to the user's message.",
              },
              reminders: {
                type: "array",
                description: "List of reminders to be scheduled.",
                items: {
                  type: "object",
                  properties: {
                    content: {
                      type: "string",
                      description: "The task or event to be reminded about.",
                    },
                    remindAt: {
                      type: "string",
                      format: "date-time",
                      description:
                        "The ISO 8601 datetime when the reminder should be sent. The time should ALWAYS be in UTC and relative to the current datetime.",
                    },
                  },
                  required: ["content", "remindAt"],
                  additionalProperties: false,
                },
              },
            },
            required: ["response", "reminders"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("No response from AI");
    }

    try {
      return JSON.parse(result);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      throw new Error("Invalid JSON response from AI");
    }
  }
}
