"use client";
import { useState } from "react";

export default function SendSMS() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const sendMessage = async () => {
    setStatus("Sending...");

    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus("Message Sent ✅");
    } else {
      setStatus("Failed to send ❌");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Send SMS via Twilio</h2>
      <input
        type="text"
        placeholder="Recipient Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 w-full rounded mb-2"
      />
      <textarea
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 w-full rounded mb-2"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send SMS
      </button>
      {status && <p className="mt-2 text-gray-600">{status}</p>}
    </div>
  );
}
