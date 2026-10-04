import { useCallback, useState } from "react";
import { GitCompareArrows, X } from "lucide-react";
import type { Player, Results } from "../types";
import { writeScoutUrl } from "../lib/scoutUrl";
import { ComparisonPicker } from "./ComparisonPicker";
import { PlayerComparison } from "./PlayerComparison";
import { PlayerCard } from "./PlayerCard";

export function PlayerDetailContent({
  player,
  rank,
  results,
}: {
  player: Player;
  rank: number;
  results: Results;
}) {
  const [picking, setPicking] = useState(
    new URLSearchParams(window.location.search).has("compare"),
  );
  const [other, setOther] = useState<Player | null>(null);
  const choose = useCallback((p: Player) => {
    setOther(p);
    setPicking(false);
  }, []);
  return (
    <>
      <div className="compare-actions">
        <button
          onClick={() => {
            setOther(null);
            setPicking(true);
            writeScoutUrl({ compare: "pick" });
          }}
        >
          <GitCompareArrows size={16} />
          {other ? "Change comparison player" : "Compare player"}
        </button>
        {(picking || other) && (
          <button
            onClick={() => {
              setOther(null);
              setPicking(false);
              writeScoutUrl({ compare: null });
            }}
          >
            <X size={15} /> End comparison
          </button>
        )}
      </div>
      {picking && (
        <ComparisonPicker player={player} results={results} onChoose={choose} />
      )}
      {other ? (
        <PlayerComparison first={player} second={other} results={results} />
      ) : (
        <PlayerCard player={player} rank={rank} team={results.team_analysis} />
      )}
    </>
  );
}
