import { readFileSync, writeFileSync } from "node:fs";
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const content = read("frontend/src/content/siteContent.json");
const data = read("backend/assets/scoutlens.json");
const snapshot = {
  prepared_at: data.prepared_at,
  players: new Set(data.players.map((p) => p.id)).size,
  spells: data.players.length,
  clubs: new Set(data.teams.map((t) => t.id)).size,
  faces: Object.keys(read("frontend/src/data/playerFaces.json")).length,
  report: data.report,
};
writeFileSync(
  "frontend/src/content/snapshot.json",
  JSON.stringify(snapshot, null, 2) + "\n",
);
const links = (items) =>
  items.map((l) => `- [${l.name}](${l.href})`).join("\n");
writeFileSync(
  "public/about.md",
  `# About ScoutLens

ScoutLens is an independent football scouting project built by ${content.creator}, with React, TypeScript and FastAPI. Choose a club, position and role across Europe's five major leagues, rank candidates and compare players through interactive graphs and recorded numbers.

${content.intro}

## Contact

${links(content.contacts)}
- [Source code](${content.repository})
- [Feedback and issues](${content.repository}/issues)

## Scope

Historical data for 2024/25 and 2025/26. Scores support research and do not replace watching matches or professional judgment. ScoutLens is not affiliated with Football Manager or its credited data providers.
`,
);
writeFileSync(
  "public/data.md",
  `# ScoutLens data and methodology

Prepared ${snapshot.prepared_at}. ${snapshot.players} distinct players, ${snapshot.spells} player-club-season records, ${snapshot.clubs} clubs, ${snapshot.faces} matched portraits. Seasons: 2024/25 and 2025/26; Premier League, La Liga, Serie A, Bundesliga, Ligue 1. Counts precede search filters. Preparation date is not the collection date of every source.

## Sources and licensing

${content.sources.map((s) => `### ${s.name}\n\n${s.by}\n\n${s.use}\n\nLicense and rights: ${s.license}\n\n${links(s.links)}`).join("\n\n")}

## Preparation and scoring

${content.method.map((s) => `### ${s.title}\n\n${s.text}`).join("\n\n")}

## Quality

${snapshot.report.unresolved_metadata} unresolved metadata records excluded. ${snapshot.report.sofascore_minutes_quarantined} SofaScore and ${snapshot.report.understat_minutes_quarantined} Understat minute conflicts quarantined. Verified joins: ${snapshot.report.sofascore_matched} SofaScore and ${snapshot.report.understat_matched} Understat records; these counts overlap.

${content.unused}

## Limitations

${content.limits.map((l) => `- ${l}`).join("\n")}

## Site analytics

ScoutLens uses Vercel Web Analytics for aggregate visitor and page-view statistics without analytics cookies. Scouting filters, player IDs and URL fragments are removed from page-view URLs. Searches and comparison clicks are not custom events. Analytics is disabled in local development. [Vercel analytics privacy](https://vercel.com/docs/analytics/privacy-policy).

## Corrections

[Contact Dilip](mailto:workwithdilip1@gmail.com) for data corrections or attribution questions. ScoutLens grants no blanket license to the combined data or photographs.
`,
);

// Use an explicitly configured production origin, never a preview deployment URL.
const configured = process.env.SITE_URL?.trim();
let origin = "";
if (configured) {
  const parsed = new URL(configured);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("SITE_URL must be a plain HTTPS production origin.");
  }
  origin = parsed.origin;
}
writeFileSync(
  "frontend/src/content/siteOrigin.json",
  JSON.stringify({ origin }) + "\n",
);
writeFileSync(
  "public/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /api/\n${origin ? `\nSitemap: ${origin}/sitemap.xml\n` : ""}`,
);
if (origin) {
  const escape = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  writeFileSync(
    "public/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["/", "/scout", "/about", "/data"].map((path) => `  <url><loc>${escape(origin + path)}</loc></url>`).join("\n")}\n</urlset>\n`,
  );
} else {
  const { rmSync } = await import("node:fs");
  rmSync("public/sitemap.xml", { force: true });
}
