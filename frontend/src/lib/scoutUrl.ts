import type { Catalog, Query } from "../types";
const fields = [
  "team_id",
  "season",
  "role",
  "position",
  "min_minutes",
  "max_age",
  "max_value",
  "foot",
  "formation",
] as const;
export function writeScoutUrl(
  patch: Record<string, string | number | null>,
  replace = false,
) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") url.searchParams.delete(key);
    else url.searchParams.set(key, String(value));
  }
  url.pathname = "/scout";
  if (url.href !== window.location.href)
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
}
export function briefToUrl(query: Query, searched: boolean) {
  writeScoutUrl({
    ...Object.fromEntries(fields.map((key) => [key, query[key]])),
    page: 1,
    player: null,
    compare: null,
    results: searched ? 1 : null,
  });
}
export function queryFromUrl(catalog: Catalog): Query {
  const params = new URLSearchParams(window.location.search);
  const season = catalog.seasons.some((s) => s.id === params.get("season"))
    ? params.get("season")!
    : "2526";
  const team =
    catalog.teams.find(
      (t) => t.id === params.get("team_id") && t.season === season,
    ) ??
    catalog.teams.find((t) => t.name === "Arsenal" && t.season === season) ??
    catalog.teams[0];
  const role =
    catalog.roles.find((r) => r.id === params.get("role")) ??
    catalog.roles.find((r) => r.id === "goalscorer")!;
  const position = role.positions.includes(params.get("position") ?? "")
    ? params.get("position")!
    : role.position;
  const bounded = (key: string, fallback: number, min: number, max: number) => {
    const raw = params.get(key),
      value = raw === null ? fallback : Number(raw);
    return Number.isInteger(value) && value >= min && value <= max
      ? value
      : fallback;
  };
  const formation = params.get("formation");
  return {
    team_id: team.id,
    season,
    role: role.id,
    position,
    min_minutes: bounded("min_minutes", 900, 180, 3420),
    max_age: bounded("max_age", 35, 16, 45),
    max_value: params.has("max_value")
      ? bounded("max_value", 1_000_000_000, 0, 1_000_000_000)
      : null,
    foot: ["left", "right", "both"].includes(params.get("foot") ?? "")
      ? params.get("foot")!
      : "any",
    formation:
      formation &&
      formation.length <= 30 &&
      /^\d+(?:-\d+)+$/.test(formation) &&
      formation.split("-").reduce((sum, n) => sum + Number(n), 0) === 10
        ? formation
        : null,
    page: bounded("page", 1, 1, 1000),
    page_size: 25,
  };
}
