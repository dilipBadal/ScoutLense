import { useId, useState } from "react";
import type { Metric } from "../../types";
import { radarMetricLabel } from "../../lib/metricLabels";
const point = (index: number, count: number, value: number) => {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return [
    160 + (Math.cos(angle) * 86 * value) / 100,
    128 + (Math.sin(angle) * 86 * value) / 100,
  ];
};
export function RadarChart({
  metrics,
  comparison,
  name,
  comparisonName = "Incumbents",
  playerName = "Candidate",
  comparisonColor = "#ad8747",
}: {
  metrics: Metric[];
  comparison: Metric[];
  name: string;
  comparisonName?: string;
  playerName?: string;
  comparisonColor?: string;
}) {
  const id = useId();
  const [showClub, setShowClub] = useState(true);
  const [showMedian, setShowMedian] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = metrics.find((m) => m.key === activeKey);

  const team = new Map(comparison.map((m) => [m.key, m]));
  const complete = metrics.every((m) => team.has(m.key));
  const polygon = (values: number[]) =>
    values.map((v, i) => point(i, metrics.length, v).join(",")).join(" ");
  return (
    <figure className="radar-chart" aria-labelledby={id}>
      <figcaption id={id}>Role profile · positional percentiles</figcaption>
      <svg
        viewBox="0 0 320 260"
        role="group"
        aria-label={`${name} compared with positional percentile 50${complete ? ` and ${comparisonName}` : ""}. Exact values follow in the table.`}
      >
        {[25, 50, 75, 100]
          .filter((v) => v !== 50 || showMedian)
          .map((v) => (
            <polygon
              key={v}
              className={v === 50 ? "radar-midline" : "radar-grid"}
              points={polygon(metrics.map(() => v))}
            />
          ))}
        {metrics.map((m, i) => {
          const end = point(i, metrics.length, 100),
            label = point(i, metrics.length, 120);
          const lines = radarMetricLabel(m.key, m.label);
          return (
            <g key={m.key}>
              <line
                className="radar-grid"
                x1="160"
                y1="128"
                x2={end[0]}
                y2={end[1]}
              />
              <text
                x={label[0]}
                y={label[1]}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <title>{m.label}</title>
                {lines.map((line, index) => (
                  <tspan
                    key={line}
                    x={label[0]}
                    dy={index === 0 ? -((lines.length - 1) * 6) : 12}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
        {complete && showClub && (
          <polygon
            className="radar-team"
            style={{ stroke: comparisonColor, fill: comparisonColor + "30" }}
            points={polygon(metrics.map((m) => team.get(m.key)!.percentile))}
          />
        )}
        <polygon
          className="radar-player"
          points={polygon(metrics.map((m) => m.percentile))}
        />
        {metrics.map((m, i) => {
          const p = point(i, metrics.length, m.percentile);
          return (
            <g
              key={m.key}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${m.label}`}
              aria-pressed={activeKey === m.key}
              onMouseEnter={() => setActiveKey(m.key)}
              onFocus={() => setActiveKey(m.key)}
              onClick={() => setActiveKey(m.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveKey(m.key);
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setActiveKey(null);
                }
              }}
            >
              <circle cx={p[0]} cy={p[1]} r="12" className="radar-hit" />
              <circle
                cx={p[0]}
                cy={p[1]}
                r={activeKey === m.key ? 5 : 3}
                className="radar-dot"
              />
            </g>
          );
        })}
      </svg>
      <div className="chart-legend">
        <span>
          <i className="legend-player" />
          {playerName}
        </span>
        <button
          type="button"
          aria-pressed={showClub}
          onClick={() => setShowClub(!showClub)}
        >
          <i className="legend-team" style={{ background: comparisonColor }} />
          {comparisonName}
          {!complete && " (partial data)"}
        </button>
        <button
          type="button"
          aria-pressed={showMedian}
          onClick={() => setShowMedian(!showMedian)}
        >
          <i className="legend-peer" />
          Percentile 50
        </button>
      </div>
      <p className="chart-inspector" role="status" aria-live="polite">
        {active
          ? `${active.label}: ${active.value.toFixed(active.unit === "%" ? 1 : 2)}${active.unit} · ${playerName} percentile ${active.percentile.toFixed(1)} · ${comparisonName} ${team.get(active.key)?.percentile.toFixed(1) ?? "unavailable"} · ${Math.round(active.weight * 100)}% role weight · ${active.benchmark_count} benchmark players`
          : "Hover, tap or focus a point to inspect its metric. Toggle the legend to hide comparisons."}
      </p>
      <div className="chart-table-wrap">
        <table className="chart-table">
          <caption className="sr-only">
            Positional percentile comparison
          </caption>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Player</th>
              <th>
                {comparisonName === "Incumbents" ? "Club" : comparisonName}
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.key}>
                <th scope="row">
                  <button
                    className="metric-inspect"
                    aria-pressed={activeKey === m.key}
                    onClick={() => setActiveKey(m.key)}
                  >
                    {m.label}
                  </button>
                </th>
                <td>{m.percentile.toFixed(0)}</td>
                <td>{team.get(m.key)?.percentile.toFixed(0) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="chart-note">
        Outer edge = percentile 100. Higher means more of the measured
        statistic. Comparison values describe recorded output, not a required
        target.
      </p>
    </figure>
  );
}
