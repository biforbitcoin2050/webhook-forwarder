import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // The webhook URL you want to forward to
    const targetWebhook = process.env.TARGET_WEBHOOK_URL;
    
    // Forward the same data and headers
    await fetch(targetWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...req.headers,
      },
      body: JSON.stringify(req.body),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Forward failed", details: err.toString() });
  }
}
