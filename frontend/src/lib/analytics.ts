import type { BeforeSendEvent } from "@vercel/analytics/react";

const publicPages = new Set(["/", "/scout", "/about", "/data"]);

/** Keep reports at page level; exclude scouting briefs and saved player IDs. */
export function sanitizePageview(
  event: BeforeSendEvent,
): BeforeSendEvent | null {
  if (event.type !== "pageview") return null;
  try {
    const url = new URL(event.url);
    if (!publicPages.has(url.pathname)) return null;
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return null;
  }
}
