import type { Results } from "../types";
import { BarChart } from "./charts/BarChart";
export function TeamCharts({ results }: { results: Results }) {
  const { team, team_analysis: analysis } = results;
  return (
    <details className="team-charts">
      <summary>
        <span>{team.name} · team context</span>
        <span>{analysis.position_name}</span>
      </summary>
      <div className="analytics-grid">
        <div>
          <BarChart
            title="Possession · team vs league"
            unit="%"
            items={[
              { label: team.name, value: team.possession },
              { label: "League average", value: analysis.league_possession },
            ]}
          />
          <p className="chart-note">
            {analysis.league_sample} clubs in the season average. Possession
            alone does not establish tactical style.
          </p>
        </div>
        <div>
          <BarChart
            title="Most recorded formations"
            unit=" matches"
            max={Math.max(1, ...team.formations.map((f) => f.matches))}
            items={team.formations.map((f) => ({
              label: f.name,
              value: f.matches,
            }))}
          />
          {!team.formations.length && (
            <p className="chart-note">Formation history unavailable.</p>
          )}
          <p className="chart-note">
            Top three formations in recorded league matches; coverage may be
            incomplete.
          </p>
        </div>
        <div className="chart-wide">
          <BarChart
            title={`Current ${analysis.position_name.toLowerCase()} profile · positional percentiles`}
            reference={50}
            items={analysis.metrics.map((m) => ({
              label: m.label,
              value: m.percentile,
              note: `${m.value.toFixed(m.unit === "%" ? 1 : 2)}${m.unit} · ${m.sample_players} incumbent${m.sample_players === 1 ? "" : "s"}`,
            }))}
          />
          {!analysis.metrics.length && (
            <p className="chart-note">
              No comparable incumbent statistics available for this position and
              role.
            </p>
          )}
          <p className="chart-note">
            Dashed marker: percentile 50. {analysis.note}
          </p>
        </div>
      </div>
      <details className="squad-coverage">
        <summary>View squad position coverage and comparison sample</summary>
        <div className="coverage-list">
          {analysis.position_coverage.map((p) => (
            <span key={p.id}>
              {p.id} <strong>{p.players}</strong>
            </span>
          ))}
        </div>
        <p className="chart-note">
          Incumbent sample:{" "}
          {analysis.incumbents.length
            ? analysis.incumbents
                .map((p) => `${p.name} (${p.minutes.toLocaleString()} min)`)
                .join("; ")
            : "No players with at least 450 minutes."}
        </p>
      </details>
    </details>
  );
}
