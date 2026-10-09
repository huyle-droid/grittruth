const base = process.env.VERIFY_BASE_URL || "http://localhost:3000";
const routes = [
  "/",
  "/product",
  "/how-it-works",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];
for (const path of routes) {
  const r = await fetch(base + path);
  const html = await r.text();
  if (r.status !== 200) throw new Error(path + ": unexpected status");
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(
    /<meta name="description" content="([^"]+)"/,
  )?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!title?.includes("GritTruth") || !description || !canonical)
    throw new Error(path + ": missing metadata");
  if (new URL(canonical).pathname !== path)
    throw new Error(path + ": wrong canonical");
  if (
    r.headers.get("x-frame-options") !== "DENY" ||
    r.headers.get("x-content-type-options") !== "nosniff"
  )
    throw new Error(path + ": missing headers");
  console.log("PASS metadata + security headers: " + path);
}
for (const path of ["/workspace?demo=1", "/login"]) {
  const html = await (await fetch(base + path)).text();
  if (!/<meta name="robots" content="noindex, nofollow"/.test(html))
    throw new Error(path + ": indexing is not blocked");
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
if (
  routes.some((p) => !sitemap.includes("grittruth.com" + (p === "/" ? "" : p)))
)
  throw new Error("Incomplete sitemap");
const robots = await (await fetch(base + "/robots.txt")).text();
if (!robots.includes("Disallow: /workspace"))
  throw new Error("Missing robots rule");
console.log("PASS sitemap, robots and private-route noindex");
