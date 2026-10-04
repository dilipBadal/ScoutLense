import { PlayerAvatar } from "./PlayerAvatar";
import { useEffect, useState } from "react";
import { searchPlayers } from "../api";
import type { Player, Results } from "../types";
import { writeScoutUrl } from "../lib/scoutUrl";

export function ComparisonPicker({
  player,
  results,
  onChoose,
}: {
  player: Player;
  results: Results;
  onChoose: (p: Player) => void;
}) {
  const [term, setTerm] = useState("");
  const [matches, setMatches] = useState(
    results.players.filter((p) => p.id !== player.id).slice(0, 5),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true);
      setError("");
      try {
        const params = new URLSearchParams(window.location.search);
        const restoreId =
          term === "" && /^\d{1,15}$/.test(params.get("compare") ?? "")
            ? params.get("compare")
            : null;
        const data = await searchPlayers(
          {
            ...results.query,
            page: 1,
            page_size: 10,
            name: term,
            player_id: restoreId,
            purpose: term.trim() || restoreId ? "comparison" : "recruitment",
          },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setMatches(data.players.filter((p) => p.id !== player.id));
        if (restoreId) {
          const found = data.players.find(
            (p) => p.id === restoreId && p.id !== player.id,
          );
          if (found) onChoose(found);
          else
            setError(
              "This comparison player no longer matches the brief. Choose another player.",
            );
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : "Unable to search players.",
          );
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, retry, results, player.id, onChoose]);
  return (
    <section
      className="comparison-picker"
      aria-label="Choose comparison player"
    >
      <label className="field">
        <span>Search comparison players</span>
        <input
          type="search"
          maxLength={100}
          value={term}
          placeholder="Search by player name…"
          onChange={(e) => {
            writeScoutUrl({ compare: "pick" }, true);
            setTerm(e.target.value);
            setError("");
            setBusy(true);
          }}
        />
      </label>
      <p className="field-help">
        Same season, position, role and filters as your shortlist.{" "}
        {term
          ? "Name search includes current squad players, ranked by fit."
          : "Best available fits for this brief."}
      </p>
      {error && (
        <p role="alert">
          {error} <button onClick={() => setRetry(retry + 1)}>Try again</button>
        </p>
      )}
      {busy ? (
        <p role="status">Finding players…</p>
      ) : (
        <div className="comparison-options">
          {matches.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                writeScoutUrl({ compare: p.id });
                onChoose(p);
              }}
            >
              <PlayerAvatar id={p.id} name={p.name} size={40} />
              <div className="comparison-option-label">
                <strong>{p.name}</strong>
                <span>
                  {p.team} · Fit {p.score.toFixed(1)}
                  {p.team_id === results.query.team_id ? " · Current squad" : ""}
                </span>
              </div>
            </button>
          ))}
          {!matches.length && !error && (
            <p>
              No comparable players for this name in the selected season,
              position and filters. Try adjusting the recruitment brief.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
