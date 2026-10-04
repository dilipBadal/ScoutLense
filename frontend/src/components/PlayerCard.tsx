import { PlayerCharts } from "./PlayerCharts";
import { PlayerAvatar } from "./PlayerAvatar";
import { ArrowUpRight, Check } from "lucide-react";
import type { Player, TeamAnalysis } from "../types";
const money = (value: number | null) =>
  value === null
    ? "Not available"
    : new Intl.NumberFormat("en", {
        style: "currency",
        currency: "EUR",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
export function PlayerCard({
  player,
  rank,
  team,
}: {
  player: Player;
  rank: number;
  team: TeamAnalysis;
}) {
  return (
    <article className="player-card">
      <div className="player-heading">
        <span className="rank">{String(rank).padStart(2, "0")}</span>
        <PlayerAvatar id={player.id} name={player.name} size={64} />
        <div className="player-identity">
          <h3>{player.name}</h3>
          <p>
            {player.team} <span>·</span> {player.age} years <span>·</span>{" "}
            {player.foot ? `${player.foot}-footed` : "Foot unknown"}
          </p>
        </div>
        <div className="fit">
          <strong>
            {player.score.toFixed(0)}
            <small>/100</small>
          </strong>
          <span>Fit score</span>
        </div>
      </div>
      <div className="player-content">
        <div>
          <span className="eyebrow">Why this player</span>
          <ul className="reasons">
            {player.reasons.map((r) => (
              <li key={r}>
                <Check size={14} />
                {r}
              </li>
            ))}
          </ul>
          <p className="tradeoff">Watch point: {player.tradeoff}</p>
        </div>
        <div className="player-facts">
          <div>
            <span>Market value</span>
            <strong>{money(player.value)}</strong>
            <small>{player.value_date ?? "No dated valuation"}</small>
          </div>
          <div>
            <span>Evidence</span>
            <strong className={`confidence ${player.confidence.toLowerCase()}`}>
              {player.confidence}
            </strong>
            <small>{player.minutes.toLocaleString()} minutes</small>
          </div>
        </div>
      </div>
      <section
        className="player-details"
        aria-label="Evidence and score breakdown"
      >
        <div className="evidence">
          <PlayerCharts player={player} team={team} />
          <p>
            Role: <strong>{player.role_score.toFixed(1)}</strong> / 100 ·
            Possession context:{" "}
            <strong>{player.compatibility?.toFixed(1) ?? "Unavailable"}</strong>
          </p>
          <p className="field-help">
            Percentiles compare the same position across five leagues. Higher
            indicates a higher observed value, not guaranteed ability.
          </p>
          <div className="chart-table-wrap">
            <table className="chart-table">
              <caption className="raw-metrics-caption">
                Underlying role statistics
              </caption>
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">Recorded value</th>
                  <th scope="col">Role weight</th>
                  <th scope="col">Benchmark players</th>
                </tr>
              </thead>
              <tbody>
                {player.metrics.map((m) => (
                  <tr key={m.key}>
                    <th scope="row">{m.label}</th>
                    <td>
                      {m.value.toFixed(m.unit === "%" ? 1 : 2)}
                      {m.unit}
                    </td>
                    <td>{Math.round(m.weight * 100)}%</td>
                    <td>{m.benchmark_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="field-help">
            Sources: {player.sources.join(", ")} · {player.position_source}.
            Contract: {player.contract ?? "Unknown"}.
          </p>
          {player.history.length > 0 && (
            <p className="field-help">
              Other-season spells:{" "}
              {player.history
                .map((h) => `${h.team}, ${h.minutes.toLocaleString()} minutes`)
                .join("; ")}
              .
            </p>
          )}
          <a
            href={`https://www.transfermarkt.com/-/profil/spieler/${player.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Transfermarkt profile <ArrowUpRight size={13} />
          </a>
        </div>
      </section>
    </article>
  );
}
