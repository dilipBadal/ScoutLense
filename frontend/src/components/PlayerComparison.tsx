import type { Player, Results } from "../types";
import { PlayerAvatar } from "./PlayerAvatar";
import { RadarChart } from "./charts/RadarChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { ScoreComposition } from "./charts/ScoreComposition";

const contributions = (p: Player) => {
  const roleWeight = p.compatibility === null ? 1 : 0.9;
  const items = p.metrics.map((m) => ({
    label: m.label,
    value: m.percentile * m.weight * roleWeight,
    note: `${Math.round(m.weight * 100)}% role weight`,
  }));
  if (p.compatibility !== null)
    items.push({
      label: "Possession context",
      value: p.compatibility * 0.1,
      note: "10% of final score",
    });
  return items;
};
export function PlayerComparison({
  first,
  second,
  results,
}: {
  first: Player;
  second: Player;
  results: Results;
}) {
  return (
    <section
      className="player-comparison"
      aria-label={`${first.name} versus ${second.name}`}
    >
      <div className="comparison-identities">
        {[first, second].map((p, i) => (
          <article
            key={p.id}
            className={i === 0 ? "comparison-first" : "comparison-second"}
          >
            <span className="eyebrow">PLAYER {i + 1}</span>
            <div className="comparison-name">
              <PlayerAvatar id={p.id} name={p.name} size={72} />
              <h3>{p.name}</h3>
            </div>
            <p>
              {p.team} · {p.age} years · {p.foot ?? "Unknown foot"}
            </p>
            <strong>
              {p.score.toFixed(1)}
              <small>/100 fit</small>
            </strong>
            <span>
              {p.confidence} evidence · {p.minutes.toLocaleString()} minutes
            </span>
          </article>
        ))}
      </div>
      <p className="chart-note">
        Same {results.query.position} brief, season, role weights and positional
        benchmarks. These are observed profiles, not predictions of transfer
        success.
      </p>
      <div className="fit-charts-grid">
        <RadarChart
          key={`${first.id}-${second.id}`}
          metrics={first.metrics}
          comparison={second.metrics}
          name={first.name}
          comparisonName={second.name}
          comparisonColor="#3866a6"
          playerName={first.name}
        />
        <ScatterPlot
          title="Role performance vs playing time"
          axis="Weighted role score"
          points={[first, second].map((p, i) => ({
            id: p.id,
            label: p.name,
            minutes: p.minutes,
            value: p.role_score,
            candidate: i === 0,
          }))}
        />
      </div>
      <div className="chart-table-wrap">
        <table className="chart-table comparison-numbers">
          <caption>Recorded statistics and score differences</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">{first.name}</th>
              <th scope="col">{second.name}</th>
              <th scope="col">Difference (1 − 2)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Overall fit", first.score, second.score],
              ["Role score", first.role_score, second.role_score],
              ["Possession context", first.compatibility, second.compatibility],
            ].map(([label, a, b]) => (
              <tr key={String(label)}>
                <th scope="row">{label}</th>
                <td>{typeof a === "number" ? a.toFixed(1) : "—"}</td>
                <td>{typeof b === "number" ? b.toFixed(1) : "—"}</td>
                <td>
                  {typeof a === "number" && typeof b === "number"
                    ? (a - b).toFixed(1) + " pts"
                    : "—"}
                </td>
              </tr>
            ))}
            {first.metrics.map((m) => {
              const other = second.metrics.find((n) => n.key === m.key);
              return (
                <tr key={m.key}>
                  <th scope="row">
                    {m.label}
                    <small>{Math.round(m.weight * 100)}% role weight</small>
                  </th>
                  <td>
                    {m.value.toFixed(m.unit === "%" ? 1 : 2)}
                    {m.unit}
                    <small>P{m.percentile.toFixed(1)}</small>
                  </td>
                  <td>
                    {other
                      ? other.value.toFixed(m.unit === "%" ? 1 : 2) + m.unit
                      : "—"}
                    <small>
                      {other ? "P" + other.percentile.toFixed(1) : "No data"}
                    </small>
                  </td>
                  <td>
                    {other
                      ? (m.percentile - other.percentile).toFixed(1) +
                        " percentile pts"
                      : "—"}
                  </td>
                </tr>
              );
            })}
            {[
              ["Market value", first.value, second.value],
              ["Age", first.age, second.age],
              ["Minutes", first.minutes, second.minutes],
            ].map(([label, a, b]) => (
              <tr key={String(label)}>
                <th scope="row">{label}</th>
                <td>
                  {a === null
                    ? "—"
                    : label === "Market value"
                      ? new Intl.NumberFormat("en", {
                          style: "currency",
                          currency: "EUR",
                          notation: "compact",
                        }).format(Number(a))
                      : String(a)}
                </td>
                <td>
                  {b === null
                    ? "—"
                    : label === "Market value"
                      ? new Intl.NumberFormat("en", {
                          style: "currency",
                          currency: "EUR",
                          notation: "compact",
                        }).format(Number(b))
                      : String(b)}
                </td>
                <td>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="comparison-tradeoffs">
        {[first, second].map((p) => (
          <article key={p.id}>
            <h4>{p.name} · watch point</h4>
            <p>{p.tradeoff}</p>
            <p className="chart-note">
              Sources: {p.sources.join(", ")} · Value dated{" "}
              {p.value_date ?? "unknown"}.
            </p>
          </article>
        ))}
      </div>
      <div className="fit-charts-grid">
        {[first, second].map((p) => (
          <section key={p.id}>
            <h4>{p.name}</h4>
            <ScoreComposition score={p.score} items={contributions(p)} />
          </section>
        ))}
      </div>
    </section>
  );
}
