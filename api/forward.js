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

  const body = await request.text();

  await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

