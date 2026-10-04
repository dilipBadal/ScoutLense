import { useState } from "react";
import type { Player, TeamAnalysis } from "../../types";
import { Select } from "../Select";
import { ScatterPlot } from "./ScatterPlot";

export function SquadComparison({
  player,
  team,
}: {
  player: Player;
  team: TeamAnalysis;
}) {
  const [metric, setMetric] = useState("role");
  const chosen = player.metrics.find((m) => m.key === metric);
  const key = chosen ? metric : "role";
  const scores = [
    {
      id: player.id,
      name: player.name,
      metrics: player.metrics,
      role_score: player.role_score,
      minutes: player.minutes,
    },
    ...team.incumbents,
  ];
  return (
    <div className="squad-comparison">
      <Select
        label="Compare with individual club players"
        value={key}
        onChange={setMetric}
      >
        <option value="role">Weighted role score</option>
        {player.metrics.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label} percentile
          </option>
        ))}
      </Select>
      <ScatterPlot
        title={
          chosen
            ? `${chosen.label} vs playing time`
            : "Role performance vs playing time"
        }
        points={scores.map((p, index) => {
          const m = p.metrics?.find((m) => m.key === key);
          return {
            id: `${index}-${p.id}`,
            label: p.name,
            candidate: index === 0,
            minutes: p.minutes,
            value: key === "role" ? p.role_score : (m?.percentile ?? null),
            note: m
              ? m.value.toFixed(m.unit === "%" ? 1 : 2) + m.unit
              : undefined,
          };
        })}
        axis={chosen ? `${chosen.label} percentile` : "Weighted role score"}
      />
      <p className="chart-note">
        Same positional benchmarks and role weights. Club players need at least
        450 minutes; benchmark players need 900. Role scores exclude possession
        context. Missing metrics are not filled in.{" "}
        {team.incumbents.length === 0 &&
          "No eligible club players are available."}
      </p>
    </div>
  );
}
