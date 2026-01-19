export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const target = process.env.TARGET_WEBHOOK_URL;
    if (!target) {
      return res.status(500).json({ error: "TARGET_WEBHOOK_URL missing" });
    }

    let body = req.body;

    // Handle raw body if Vercel didn't parse it
    if (!body) {
      let raw = "";
      await new Promise((resolve) => {
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", resolve);
      });
      body = raw ? JSON.parse(raw) : {};
    }

    await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({
      error: "Runtime failure",
      message: err.message,
    });
  }
}
