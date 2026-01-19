export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const targetWebhook = process.env.TARGET_WEBHOOK_URL;
    if (!targetWebhook) {
      return res.status(500).json({ error: "TARGET_WEBHOOK_URL not set" });
    }

    await fetch(targetWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
