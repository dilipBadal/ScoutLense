import { useEffect } from "react";
import { origin } from "../content/siteOrigin.json";

const pages: Record<string, [string, string]> = {
  "/": [
    "ScoutLens · Recruitment intelligence",
    "Explainable football recruitment across Europe’s five major leagues. Define a role, find candidates and compare the evidence.",
  ],
  "/scout": [
    "Scouting workspace · ScoutLens",
    "Find and compare players for your club, position and role using historical performance, interactive graphs and transparent fit scores.",
  ],
  "/about": [
    "About · ScoutLens",
    "Meet ScoutLens and its creator, Dilip Badal. Explore the project, source code and ways to get in touch.",
  ],
  "/data": [
    "Data & methodology · ScoutLens",
    "Explore ScoutLens data sources, licenses, historical coverage, scoring methods and limitations.",
  ],
};
export function usePageMetadata(path: string) {
  useEffect(() => {
    const [title, description] = pages[path] ?? [
      "Page not found · ScoutLens",
      "This ScoutLens page does not exist.",
    ];
    document.title = title;
    document.querySelector('link[rel="canonical"]')?.remove();
    if (origin && pages[path]) {
      const canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = origin + path;
      document.head.append(canonical);
    }
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    for (const property of ["og:title", "og:description"]) {
      document
        .querySelector(`meta[property="${property}"]`)
        ?.setAttribute(
          "content",
          property.endsWith("title") ? title : description,
        );
    }
    document
      .querySelector('link[rel="alternate"][type="text/markdown"]')
      ?.remove();
    if (path === "/about" || path === "/data") {
      const alternate = document.createElement("link");
      alternate.rel = "alternate";
      alternate.type = "text/markdown";
      alternate.href = `${path}.md`;
      document.head.append(alternate);
    }
  }, [path]);
}
