// WhatsApp Business Phone Number ID
const PHONE_NUMBER_ID = "705847639280522";
// WhatsApp Business Access Token (permanent token)
// Generate a new one here: https://business.facebook.com/latest/settings/system_users?business_id=1771277540135951&selected_user_id=61578183575547
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
