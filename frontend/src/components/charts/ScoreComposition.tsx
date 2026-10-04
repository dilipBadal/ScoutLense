import { useId, useState } from "react";
const COLORS = [
  "#315d47",
  "#729662",
  "#a2ba7e",
  "#c9d6a3",
  "#b49b62",
  "#807a66",
  "#626e82",
];
export function ScoreComposition({
  score,
  items,
}: {
  score: number;
  items: { label: string; value: number; note: string }[];
}) {
  const id = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;
  const circumference = 2 * Math.PI * 76;
  const active = selected === null ? null : items[selected];
  return (
    <figure className="composition-chart chart-wide" aria-labelledby={id}>
      <figcaption id={id}>How the fit score is built</figcaption>
      <div className="composition-layout">
        <svg
          viewBox="0 0 230 230"
          role="group"
          aria-label={`Fit score ${score.toFixed(1)} out of 100. Segments show each contribution's share of the achieved score.`}
        >
          <circle
            cx="115"
            cy="115"
            r="76"
            fill="none"
            stroke="#edf1e7"
            strokeWidth="28"
          />
          {items.map((item, index) => {
            const length = total > 0 ? (item.value / total) * circumference : 0;
            const start = offset;
            offset += length;
            if (!length) return null;
            return (
              <circle
                key={item.label}
                cx="115"
                cy="115"
                r="76"
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={selected === index ? 34 : 28}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-start}
                transform="rotate(-90 115 115)"
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${item.label} score contribution`}
                aria-pressed={selected === index}
                onMouseEnter={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                onClick={() => setSelected(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(index);
                  }
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setSelected(null);
                  }
                }}
              />
            );
          })}
          <text
            x="115"
            y="116"
            textAnchor="middle"
            className="composition-total"
          >
            {score.toFixed(1)}
          </text>
          <text x="115" y="138" textAnchor="middle">
            FIT SCORE / 100
          </text>
        </svg>
        <div className="composition-key">
          {items.map((item, index) => (
            <button
              key={item.label}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <i style={{ background: COLORS[index % COLORS.length] }} />
              <span>{item.label}</span>
              <strong>{item.value.toFixed(1)} pts</strong>
            </button>
          ))}
        </div>
      </div>
      <p className="chart-inspector" role="status" aria-live="polite">
        {active
          ? `${active.label}: ${active.value.toFixed(2)} score points · ${active.note}`
          : "Hover, tap or focus a segment to inspect its contribution. Segment sizes show shares of the achieved score, not shares of a perfect 100."}
      </p>
      <p className="chart-note">
        Contributions sum to the final score before rounding. Role metrics
        supply 100% when possession context is unavailable or for goalkeepers.
        Fit is a comparative heuristic, not a probability.
      </p>
    </figure>
  );
}
