export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("use POST");
  const b = req.body || {};
  const up = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: b.model || "openai/gpt-oss-120b",
      messages: b.messages,
      temperature: b.temperature ?? 0.8,
      max_tokens: Math.min(b.max_tokens || 4096, 4096),
      stream: b.stream ?? false,
    }),
  });
  res.status(up.status);
  const ct = up.headers.get("content-type");
  if (ct) res.setHeader("Content-Type", ct);
  res.send(Buffer.from(await up.arrayBuffer()));
}
