#!/usr/bin/env node
/**
 * Lightweight SEO audit for CheApi.
 * Usage: BASE_URL=http://localhost:3001 npm run seo:audit
 */
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

function text(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function first(html, re) {
  const match = html.match(re);
  return match ? match[1].trim() : "";
}

async function main() {
  const sitemapResponse = await fetch(`${BASE}/sitemap.xml`);
  if (!sitemapResponse.ok) throw new Error(`sitemap: ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  const results = [];
  for (const loc of locs) {
    const url = new URL(loc);
    const target = `${BASE}${url.pathname}${url.search}`;
    try {
      const response = await fetch(target, { redirect: "follow" });
      const html = await response.text();
      const canonical = first(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
      const title = first(html, /<title>([^<]*)<\/title>/i);
      const description = first(
        html,
        /<meta[^>]+name="description"[^>]+content="([^"]*)"/i,
      );
      const robots = first(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i);
      const h1 = [...html.matchAll(/<h1[\s>]/gi)].length;
      const jsonLd = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
        .flatMap((match) => {
          try {
            const data = JSON.parse(match[1]);
            return (Array.isArray(data) ? data : [data]).map((item) => item["@type"]);
          } catch {
            return ["invalid-json"];
          }
        })
        .filter(Boolean);
      const words = text(html).split(/\s+/).filter(Boolean).length;

      results.push({
        path: url.pathname,
        status: response.status,
        title,
        titleLength: title.length,
        descriptionLength: description.length,
        canonical,
        robots,
        h1,
        jsonLd: [...new Set(jsonLd)],
        words,
      });
    } catch (error) {
      results.push({ path: url.pathname, status: "fetch-error", error: String(error) });
    }
  }

  const issues = [];
  const titles = new Map();

  for (const item of results) {
    if (item.path.endsWith(".txt")) continue;
    if (item.status !== 200) issues.push(`${item.status} ${item.path}`);
    if (item.h1 !== 1) issues.push(`H1=${item.h1} ${item.path}`);
    if (!item.canonical) issues.push(`no canonical ${item.path}`);
    if (item.canonical) {
      const canonicalPath = new URL(item.canonical, BASE).pathname.replace(/\/$/, "") || "/";
      const expected = item.path.replace(/\/$/, "") || "/";
      if (canonicalPath !== expected) {
        issues.push(`canonical mismatch ${item.path} -> ${canonicalPath}`);
      }
    }
    if (item.robots.includes("noindex")) issues.push(`noindex ${item.path}`);
    if (item.titleLength > 75) issues.push(`title ${item.titleLength} chars ${item.path}`);
    if (!item.descriptionLength) issues.push(`no description ${item.path}`);
    if (item.descriptionLength > 180) {
      issues.push(`long description ${item.descriptionLength} ${item.path}`);
    }
    if (item.descriptionLength && item.descriptionLength < 80) {
      issues.push(`short description ${item.descriptionLength} ${item.path}`);
    }
    if (item.words < 120) issues.push(`thin page ${item.words} words ${item.path}`);
    if (item.title) titles.set(item.title, [...(titles.get(item.title) || []), item.path]);
  }

  for (const [title, paths] of titles) {
    if (paths.length > 1) issues.push(`duplicate title: ${paths.join(", ")} — ${title}`);
  }

  console.log(`SEO audit: ${BASE}`);
  console.log(`URLs: ${results.length}`);
  console.log(`Issues: ${issues.length}`);
  console.log("");
  for (const issue of issues) console.log(`- ${issue}`);

  console.log("\nPages:");
  for (const item of results.sort((a, b) => a.path.localeCompare(b.path))) {
    console.log(
      `${String(item.status).padEnd(4)} ${item.path.padEnd(52)} h1=${item.h1} words=${item.words} ld=${(item.jsonLd || []).join(",")}`,
    );
  }

  if (issues.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
