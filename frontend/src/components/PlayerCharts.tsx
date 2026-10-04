import { SquadComparison } from "./charts/SquadComparison";
import type { Player, TeamAnalysis } from "../types";
import { RadarChart } from "./charts/RadarChart";
import { ScoreComposition } from "./charts/ScoreComposition";
export function PlayerCharts({
  player,
  team,
}: {
  player: Player;
  team: TeamAnalysis;
}) {
  const roleWeight = player.compatibility === null ? 1 : 0.9;
  const contributions = player.metrics.map((m) => ({
    label: m.label,
    value: m.percentile * m.weight * roleWeight,
    note: `${Math.round(m.weight * 100)}% role weight · ${m.value.toFixed(m.unit === "%" ? 1 : 2)}${m.unit}`,
  }));
  if (player.compatibility !== null)
    contributions.push({
      label: "Possession context",
      value: player.compatibility * 0.1,
      note: "10% of final score · possession similarity only",
    });
  const gaps = player.metrics
    .flatMap((m) => {
      const incumbent = team.metrics.find((t) => t.key === m.key);
      return incumbent
        ? [{ label: m.label, gap: m.percentile - incumbent.percentile }]
        : [];
    })
    .sort((a, b) => b.gap - a.gap);
  const positives = gaps.filter((g) => g.gap > 0).slice(0, 2);
  const negatives = gaps
    .filter((g) => g.gap < 0)
    .slice(-2)
    .reverse();
  const formatGap = (gap: number) =>
    `${gap > 0 ? "+" : ""}${gap.toFixed(1)} percentile points`;
  return (
    <section className="player-charts" aria-label={`${player.name} fit charts`}>
      <div className="fit-explanation">
        <h4>What the evidence says about this fit</h4>
        <p>
          The role score is <strong>{player.role_score.toFixed(1)}/100</strong>,
          based on observed output against players in the same position. It is
          not a forecast of performance at the destination club.
        </p>
        {positives.length > 0 && (
          <p>
            <strong>Higher than current incumbents:</strong>{" "}
            {positives
              .map((g) => `${g.label} (${formatGap(g.gap)})`)
              .join("; ")}
            .
          </p>
        )}
        {negatives.length > 0 && (
          <p>
            <strong>Lower than current incumbents:</strong>{" "}
            {negatives
              .map((g) => `${g.label} (${formatGap(g.gap)})`)
              .join("; ")}
            .
          </p>
        )}
        {gaps.length === 0 && (
          <p>
            The club has no comparable incumbent metrics for this role. We can
            assess the player’s role profile, but cannot establish a statistical
            difference from its current players.
          </p>
        )}
        <p>
          {player.compatibility === null
            ? "Possession context is not used in this score."
            : `Possession similarity is ${player.compatibility.toFixed(1)}/100 and supplies 10% of the fit score. It compares the player's origin club with the destination club; it does not measure tactical compatibility.`}
        </p>
      </div>
      <div className="fit-charts-grid">
        <RadarChart
          key={player.id}
          metrics={player.metrics}
          comparison={team.metrics}
          name={player.name}
        />
        <SquadComparison key={player.id} player={player} team={team} />
        <ScoreComposition
          key={player.id}
          score={player.score}
          items={contributions}
        />
      </div>
      <p className="chart-note">
        Club comparisons use {team.incumbents.length} position-eligible
        incumbent{team.incumbents.length === 1 ? "" : "s"} with at least 450
        minutes; each metric may have a smaller sample. Formation, off-ball
        movement and pressing compatibility have not been assessed.
      </p>
    </section>
  );
}
