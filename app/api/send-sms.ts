import { NextApiRequest, NextApiResponse } from "next";
import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = Twilio(accountSid, authToken);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { phone, message } = req.body;

  try {
    const response = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: phone,
    });

    res.status(200).json({ success: true, messageSid: response.sid });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ success: false, error: errMsg });
  }
}
