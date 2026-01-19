export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const target = process.env.TARGET_WEBHOOK_URL;
  if (!target) {
    return new Response("TARGET_WEBHOOK_URL not set", { status: 500 });
  }

  // Validate target URL
  try {
    const parsed = new URL(target);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new Response("TARGET_WEBHOOK_URL must be http or https", { status: 500 });
    }
  } catch (err) {
    return new Response("Invalid TARGET_WEBHOOK_URL", { status: 500 });
  }

  try {
    // Forward incoming headers (preserve Content-Type, signature headers, etc.)
    const forwardHeaders = new Headers();
    for (const [key, value] of request.headers) {
      const lk = key.toLowerCase();
      if (lk === "host" || lk === "content-length") continue; // don't forward Host/Content-Length
      forwardHeaders.set(key, value);
    }
    forwardHeaders.set("X-Forwarded-By", "webhook-forwarder");

    // Forward the request body as a stream so binary payloads work
    const upstreamResponse = await fetch(target, {
      method: "POST",
      headers: forwardHeaders,
      body: request.body,
      redirect: "manual",
    });

    // Read upstream response (beware of very large bodies in production)
    const upstreamText = await upstreamResponse.text().catch(() => "");

    const payload = {
      success: upstreamResponse.ok,
      targetStatus: upstreamResponse.status,
      targetStatusText: upstreamResponse.statusText,
      targetResponse: upstreamText,
    };

    return new Response(JSON.stringify(payload), {
      status: upstreamResponse.ok ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // Network / unexpected errors
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
