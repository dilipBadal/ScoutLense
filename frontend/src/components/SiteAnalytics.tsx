import { Analytics } from "@vercel/analytics/react";
import { sanitizePageview } from "../lib/analytics";

export function SiteAnalytics({ path }: { path: string }) {
  // Local development should not load the collector or generate traffic.
  if (!import.meta.env.PROD) return null;
  return (
    <Analytics
      mode="production"
      route={path}
      path={path}
      beforeSend={sanitizePageview}
    />
  );
}
