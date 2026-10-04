import { PlayerAvatar } from "./PlayerAvatar";
import { useViewTransition } from "../lib/useViewTransition";
import { useCandidateBrowser } from "../lib/useCandidateBrowser";
import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Results } from "../types";
import { PlayerDetailContent } from "./PlayerDetailContent";

export function CandidateTable({ results: initial }: { results: Results }) {
  const {
    results,
    selected,
    rank,
    busy,
    error,
    select,
    move,
    close,
    loadPage,
  } = useCandidateBrowser(initial);
  const { leaving, animate, transition } = useViewTransition(initial);
  const backButton = useRef<HTMLButtonElement>(null);
  const opening = selected !== null;
  const returnId = useRef<string | null>(null);
  useEffect(() => {
    if (opening) {
      backButton.current?.focus({ preventScroll: true });
      backButton.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    } else if (returnId.current) {
      const button = document.getElementById(`candidate-${returnId.current}`);
      button?.focus({ preventScroll: true });
      button?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
  }, [opening]);
  const back = (pointer = true) => {
    returnId.current = selected?.id ?? null;
    transition(close, pointer);
  };
  const { page, page_size, pages } = results.pagination;
  const start = (page - 1) * page_size;
  return (
    <div
      className={`candidate-browser ${selected ? "has-selection" : ""} ${leaving ? "view-leaving" : ""} ${animate ? "" : "skip-motion"}`}
    >
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="candidate-list" aria-busy={busy}>
        <div className="table-title">
          <h3>Matching players</h3>
          <span>Ranked by fit score</span>
        </div>
        <div className="candidate-scroll">
          <table className="candidate-table">
            <caption className="sr-only">
              Matching players ranked by fit. Select a player to view evidence.
            </caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Player / club</th>
                <th scope="col">Fit</th>
                <th scope="col" className="table-extra">
                  Age
                </th>
                <th scope="col" className="table-extra">
                  Minutes
                </th>
                <th scope="col" className="table-extra">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {results.players.map((player, index) => (
                <tr
                  key={player.id}
                  className={selected?.id === player.id ? "selected-row" : ""}
                  onClick={(e) => transition(() => select(index), e.detail > 0)}
                >
                  <td>{String(start + index + 1).padStart(2, "0")}</td>
                  <td>
                    <button
                      id={`candidate-${player.id}`}
                      aria-expanded={selected?.id === player.id}
                      aria-controls="player-panel"
                      onClick={(e) => {
                        e.stopPropagation();
                        transition(() => select(index), e.detail > 0);
                      }}
                    >
                      <PlayerAvatar id={player.id} name={player.name} size={32} />
                      {player.name}
                    </button>
                    <span>{player.team}</span>
                  </td>
                  <td>
                    <strong className="table-score">
                      {player.score.toFixed(1)}
                    </strong>
                  </td>
                  <td className="table-extra">{player.age}</td>
                  <td className="table-extra">
                    {player.minutes.toLocaleString()}
                  </td>
                  <td className="table-extra">
                    {player.value === null
                      ? "—"
                      : new Intl.NumberFormat("en", {
                          style: "currency",
                          currency: "EUR",
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(player.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-pagination">
          <span>
            {start + 1}–{start + results.players.length} of {results.eligible}
          </span>
          <div>
            <button
              aria-label="Previous page"
              disabled={busy || page <= 1}
              onClick={() => void loadPage(page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              aria-label="Next page"
              disabled={busy || page >= pages}
              onClick={() => void loadPage(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      {selected && (
        <section
          id="player-panel"
          className="player-panel"
          aria-label={`${selected.name} player details`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              back(false);
            }
            if (
              e.altKey ||
              e.ctrlKey ||
              e.metaKey ||
              e.shiftKey ||
              (e.target as HTMLElement).closest(
                'input, textarea, select, [contenteditable="true"]',
              )
            )
              return;
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              move(e.key === "ArrowUp" ? -1 : 1);
            }
          }}
        >
          <div className="player-panel-toolbar">
            <button
              className="player-back"
              ref={backButton}
              onClick={(e) => back(e.detail > 0)}
            >
              <ArrowLeft size={16} /> Back to players
            </button>
            <div className="player-navigation">
              <span role="status" aria-live="polite">
                {busy ? "Loading player…" : `${rank} of ${results.eligible}`}
              </span>
              <button
                aria-label="Previous player"
                title="Previous player (↑)"
                disabled={busy || rank === 1}
                onClick={() => move(-1)}
              >
                <ArrowUp size={17} />
              </button>
              <button
                aria-label="Next player"
                title="Next player (↓)"
                disabled={busy || rank === results.eligible}
                onClick={() => move(1)}
              >
                <ArrowDown size={17} />
              </button>
            </div>
          </div>
          <PlayerDetailContent
            key={selected.id}
            player={selected}
            rank={rank!}
            results={results}
          />
        </section>
      )}
    </div>
  );
}
