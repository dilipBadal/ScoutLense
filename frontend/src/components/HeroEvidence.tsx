import example from "../content/heroExample.json";
import { PlayerAvatar } from "./PlayerAvatar";
const player = example.players[0];
const labels = ["npxG", "Shots", "xA", "Aerials", "Key passes"];
const point = (index: number, value: number) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
  return [
    110 + Math.cos(angle) * value * 0.7,
    100 + Math.sin(angle) * value * 0.7,
  ];
};
const polygon = (values: number[]) =>
  values.map((value, i) => point(i, value).join(",")).join(" ");
export function HeroEvidence() {
  return (
    <div className="hero-evidence">
      <div className="hero-selected-player">
        <PlayerAvatar id={player.id} name={player.name} size={48} />
        <div>
          <strong>{player.name}</strong>
          <span>
            {player.team} · {example.role}
          </span>
        </div>
        <b>
          {player.score}
          <small>/100</small>
        </b>
      </div>
      <div className="hero-radar">
        <span className="demo-chart-label">
          Role strengths · positional percentiles
        </span>
        <svg
          viewBox="0 0 220 200"
          role="img"
          aria-label={player.metrics
            .map((m) => `${m.label}: ${m.percentile} percentile`)
            .join(", ")}
        >
          {[25, 50, 75, 100].map((v) => (
            <polygon
              className="demo-grid"
              key={v}
              points={polygon(Array(5).fill(v))}
            />
          ))}
          {player.metrics.map((m, i) => (
            <line
              className="demo-grid"
              key={m.key}
              x1="110"
              y1="100"
              x2={point(i, 100)[0]}
              y2={point(i, 100)[1]}
            />
          ))}
          <polygon
            className="demo-benchmark"
            points={polygon(Array(5).fill(50))}
          />
          <polygon
            className="demo-profile"
            points={polygon(player.metrics.map((m) => m.percentile))}
          />
          {labels.map((label, i) => (
            <text
              key={label}
              x={point(i, 127)[0]}
              y={point(i, 127)[1] + 4}
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
          {player.metrics.map((m, i) => (
            <circle
              key={m.key}
              cx={point(i, m.percentile)[0]}
              cy={point(i, m.percentile)[1]}
              r="3"
            />
          ))}
        </svg>
        <div className="demo-legend">
          <span>● {player.name}</span>
          <span>— Peer median (50)</span>
        </div>
      </div>
      <div className="hero-scatter">
        <span className="demo-chart-label">Role score vs recorded minutes</span>
        <svg
          viewBox="0 0 310 125"
          role="img"
          aria-label={example.players
            .map(
              (p) =>
                `${p.name}: ${p.role_score} role score, ${p.minutes} minutes`,
            )
            .join("; ")}
        >
          {[0, 50, 100].map((v) => (
            <g key={v}>
              <line
                className="demo-grid"
                x1="35"
                x2="290"
                y1={92 - v * 0.65}
                y2={92 - v * 0.65}
              />
              <text x="25" y={96 - v * 0.65} textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          {[0, 1500, 3000].map((v) => (
            <text key={v} x={35 + v * 0.085} y="109" textAnchor="middle">
              {v.toLocaleString()}
            </text>
          ))}
          {example.players.map((p, i) => (
            <circle
              key={p.id}
              className={`demo-dot demo-dot-${i}`}
              cx={35 + p.minutes * 0.085}
              cy={92 - p.role_score * 0.65}
              r={i === 0 ? 6 : 4}
            >
              <title>
                {p.name}: {p.role_score} · {p.minutes} minutes
              </title>
            </circle>
          ))}
        </svg>
        <span className="demo-axis-label">
          Recorded minutes · same role benchmark
        </span>
      </div>
    </div>
  );
}
