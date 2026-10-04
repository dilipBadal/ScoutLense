import { useId, useState } from "react";
const PLAYER_COLORS = [
  "#315d47",
  "#3866a6",
  "#8651a3",
  "#b05238",
  "#927223",
  "#287b80",
  "#9e446d",
  "#566579",
];
export type ScatterPoint = {
  id: string;
  label: string;
  minutes: number;
  value: number | null;
  candidate?: boolean;
  note?: string;
};

export function ScatterPlot({
  title,
  points,
  axis,
}: {
  title: string;
  points: ScatterPoint[];
  axis: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState<string | null>(null);
  // Map before filtering or drawing order changes, so a metric switch preserves colors.
  const colors = new Map(
    points.map((p, index) => [
      p.id,
      PLAYER_COLORS[index] ?? `hsl(${(index * 137.508) % 360} 45% 32%)`,
    ]),
  );
  const active = points.find((p) => p.id === selected);
  const maxMinutes = Math.max(
    1000,
    Math.ceil(Math.max(...points.map((p) => p.minutes)) / 500) * 500,
  );
  const x = (minutes: number) => 55 + (minutes / maxMinutes) * 380;
  const y = (value: number) => 255 - value * 2;
  const inspect = (p: ScatterPoint) => setSelected(p.id);
  return (
    <figure className="scatter-chart" aria-labelledby={id}>
      <figcaption id={id}>{title}</figcaption>
      <svg
        viewBox="0 0 480 320"
        role="group"
        aria-label={`${axis} from 0 to 100 versus recorded minutes. Each point represents one player.`}
      >
        <text x="55" y="24" className="plot-axis-label">
          {axis}
        </text>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1="55" x2="435" y1={y(v)} y2={y(v)} className="plot-grid" />
            <text x="43" y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={x((maxMinutes * i) / 4)}
              x2={x((maxMinutes * i) / 4)}
              y1="55"
              y2="255"
              className="plot-grid"
            />
            <text x={x((maxMinutes * i) / 4)} y="278" textAnchor="middle">
              {Math.round((maxMinutes * i) / 4).toLocaleString()}
            </text>
          </g>
        ))}
        <path d="M55 55V255H435" className="plot-axis" />
        <text x="245" y="306" textAnchor="middle" className="plot-axis-label">
          Recorded minutes
        </text>
        {points
          .filter((p) => p.value !== null)
          .sort((a, b) => Number(!!a.candidate) - Number(!!b.candidate))
          .map((p) => (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${p.label}`}
              aria-pressed={selected === p.id}
              onMouseEnter={() => inspect(p)}
              onFocus={() => inspect(p)}
              onClick={() => inspect(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inspect(p);
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setSelected(null);
                }
              }}
            >
              <circle
                cx={x(p.minutes)}
                cy={y(p.value!)}
                r="15"
                fill="transparent"
              />
              <circle
                cx={x(p.minutes)}
                cy={y(p.value!)}
                r={p.candidate ? 7 : 6}
                className="scatter-mark"
                fill={colors.get(p.id)}
              />
              {selected === p.id && (
                <circle
                  cx={x(p.minutes)}
                  cy={y(p.value!)}
                  r="11"
                  className="plot-selection"
                  stroke={colors.get(p.id)}
                />
              )}
            </g>
          ))}
      </svg>
      <p className="chart-inspector" role="status" aria-live="polite">
        {active
          ? `${active.label} · ${active.minutes.toLocaleString()} minutes · ${axis}: ${active.value?.toFixed(1) ?? "unavailable"}${active.note ? " · " + active.note : ""}`
          : "Hover, tap or focus a point to see the player and exact values. Minutes show sample size, not quality."}
      </p>
      <div className="plot-player-key">
        {points.map((p) => (
          <button
            key={p.id}
            aria-pressed={selected === p.id}
            style={{
              backgroundColor: colors.get(p.id),
              borderColor: colors.get(p.id),
            }}
            onClick={() => inspect(p)}
          >
            {p.label}
            {p.candidate && <span className="candidate-tag"> · Candidate</span>}
            {p.value === null ? " · no data" : ""}
          </button>
        ))}
      </div>
    </figure>
  );
}
