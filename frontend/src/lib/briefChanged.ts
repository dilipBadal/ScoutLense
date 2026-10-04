import type { Query } from "../types";
const briefFields = [
  "team_id",
  "season",
  "role",
  "position",
  "formation",
  "min_minutes",
  "max_age",
  "max_value",
  "foot",
] as const;
export function briefChanged(draft: Query, applied: Query) {
  return briefFields.some((key) => draft[key] !== applied[key]);
}
