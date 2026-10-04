import type { Catalog, Query, Results } from "./types";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path}`, init);
  if (!response.ok) {
    let message = `Request failed (${response.status}). Please try again.`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      /* Retain a useful error for non-JSON responses. */
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}
// Version the catalogue URL when its contract changes so cached older responses expire safely.
export const getCatalog = async () => {
  const catalog = await request<Catalog>("catalog?schema=2");
  if (
    !Array.isArray(catalog.positions) ||
    !Array.isArray(catalog.roles) ||
    !Array.isArray(catalog.teams)
  ) {
    throw new Error(
      "The scouting catalogue is outdated. Restart the API and try again.",
    );
  }
  return catalog;
};
export const searchPlayers = (query: Query, signal: AbortSignal) =>
  request<Results>("recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
    signal,
  });
