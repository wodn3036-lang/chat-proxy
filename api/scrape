export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  const raw = (req.query?.url || req.body?.url || "").trim();
  let u;
  try { u = new URL(raw); } catch { return res.status(400).json({ error: "bad url" }); }
  if (!u.hostname.endsWith("rofan.ai")) return res.status(400).json({ error: "rofan.ai only" });

  const up = await fetch(u.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (CHAT importer)", "Accept-Language": "ko,en" },
  });
  if (!up.ok) return res.status(502).json({ error: "fetch failed: " + up.status });
  const html = await up.text();

  const dec = (s) => (s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).trim();

  const meta = (key) => {
    let m = html.match(new RegExp(`<meta[^>]*property=["']${key}["'][^>]*content=["']([^"']*)`, "i"))
      || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${key}["']`, "i"))
      || html.match(new RegExp(`<meta[^>]*name=["']${key}["'][^>]*content=["']([^"']*)`, "i"));
    return m ? dec(m[1]) : "";
  };

  let text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(br|p|div|h1|h2|h3|li|tr)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ");
  text = dec(text).replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();

  const cut = (from, to) => {
    const i = text.indexOf(from);
    if (i < 0) return "";
    const j = to ? text.indexOf(to, i + from.length) : text.length;
    return text.slice(i + from.length, j < 0 ? text.length : j).trim();
  };

  const tags = [...new Set([...html.matchAll(/\/tag\/([^"'<>\s?#]+)/g)]
    .map((m) => { try { return decodeURIComponent(m[1]); } catch { return ""; } })
    .filter(Boolean))];

  const images = [...new Set([...html.matchAll(/https:\/\/img\.rofan\.ai\/[^"'<>\s]+?\.webp/gi)]
    .map((m) => m[0]).filter((s) => !s.includes("/blur/")))];

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  return res.status(200).json({
    name: meta("og:title") || (h1 ? dec(h1[1].replace(/<[^>]+>/g, "")) : ""),
    image: images[0] || meta("og:image") || "",
    images,
    tags,
    short: meta("og:description") || meta("description") || "",
    worldview: cut("Worldview", "Character Introduction"),
    intro: cut("Character Introduction", "제작일"),
  });
};
