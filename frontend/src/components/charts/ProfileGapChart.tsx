import { useState } from "react";
import { Select } from "../Select";
import { ChartDatum } from "./ChartDatum";
import { useId } from "react";
import type { Metric } from "../../types";
export function ProfileGapChart({
  metrics,
  comparison,
}: {
  metrics: Metric[];
  comparison: Metric[];
}) {
  const id = useId();
  const [sort, setSort] = useState("role");
  const ordered = [...metrics].sort((a, b) =>
    sort === "gap"
      ? Math.abs(
          b.percentile -
            (comparison.find((m) => m.key === b.key)?.percentile ??
              b.percentile),
        ) -
        Math.abs(
          a.percentile -
            (comparison.find((m) => m.key === a.key)?.percentile ??
              a.percentile),
        )
      : 0,
  );
  const team = new Map(comparison.map((m) => [m.key, m]));
  return (
    <figure className="gap-chart" aria-labelledby={id}>
      <figcaption id={id}>Where the player differs from the club</figcaption>
      <Select label="Order metrics" value={sort} onChange={setSort}>
        <option value="role">Role order</option>
        <option value="gap">Largest difference first</option>
      </Select>
      <div className="gap-axis" aria-hidden="true">
        <span>−100</span>
        <span>Same percentile</span>
        <span>+100</span>
      </div>
      {ordered.map((m) => {
        const incumbent = team.get(m.key);
        const gap = incumbent ? m.percentile - incumbent.percentile : null;
        return (
          <ChartDatum
            key={m.key}
            label={`${m.label} comparison details`}
            detail={`${m.label} · Candidate percentile ${m.percentile.toFixed(1)} · Club ${incumbent?.percentile.toFixed(1) ?? "unavailable"} · Role weight ${Math.round(m.weight * 100)}%`}
          >
            <div className="gap-row">
              <div className="bar-label">
                <span>{m.label}</span>
                <strong>
                  {gap === null
                    ? "No club data"
                    : `${gap > 0 ? "+" : ""}${gap.toFixed(1)} pp`}
                </strong>
              </div>
              <div className="gap-track" aria-hidden="true">
                <i className="gap-zero" />
                {gap !== null && (
                  <div
                    className={`gap-fill ${gap < 0 ? "negative" : ""}`}
                    style={{
                      left: `${gap < 0 ? 50 + gap / 2 : 50}%`,
                      width: `${Math.abs(gap) / 2}%`,
                    }}
                  />
                )}
              </div>
              <p className="chart-note">
                Player: {m.value.toFixed(m.unit === "%" ? 1 : 2)}
                {m.unit} · Club:{" "}
                {incumbent
                  ? `${incumbent.value.toFixed(m.unit === "%" ? 1 : 2)}${m.unit}`
                  : "unavailable"}
              </p>
            </div>
          </ChartDatum>
        );
      })}
      <p className="chart-note">
        pp = positional percentile points. Right means a higher observed
        statistic, left a lower one. Differences describe the player’s current
        output relative to incumbents; they do not predict improvement after a
        transfer.
      </p>
    </figure>
  );
}
