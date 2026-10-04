import { useState } from "react";
import type { Results } from "../types";
import { BarChart } from "./charts/BarChart";
import { Select } from "./Select";
export function ShortlistChart({ results }: { results: Results }) {
  const [metric, setMetric] = useState("score");
  const metrics = results.players[0]?.metrics ?? [];
  const validMetric = [
    "score",
    "role_score",
    ...metrics.map((m) => m.key),
  ].includes(metric)
    ? metric
    : "score";
  const label =
    validMetric === "score"
      ? "Overall fit score"
      : validMetric === "role_score"
        ? "Role score"
        : `${metrics.find((m) => m.key === validMetric)?.label} percentile`;
  return (
    <section
      className="shortlist-chart"
      aria-label="Compare shortlisted players"
    >
      <div className="chart-heading">
        <span className="eyebrow">COMPARE THIS PAGE’S FIRST FIVE</span>
        <Select label="Compare by" value={validMetric} onChange={setMetric}>
          <option value="score">Overall fit score</option>
          <option value="role_score">Role score</option>
          {metrics.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label} percentile
            </option>
          ))}
        </Select>
      </div>
      <BarChart
        title={label}
        items={results.players.slice(0, 5).map((p) => ({
          label: p.name,
          value:
            validMetric === "score"
              ? p.score
              : validMetric === "role_score"
                ? p.role_score
                : (p.metrics.find((m) => m.key === validMetric)?.percentile ??
                  null),
        }))}
      />
      <p className="chart-note">
        Same position, season and role. Fit is a comparative score, not the
        probability that a signing will succeed.
      </p>
    </section>
  );
}
