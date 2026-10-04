import { writeScoutUrl } from "./scoutUrl";
import { useEffect, useRef, useState } from "react";
import { searchPlayers } from "../api";
import type { Results } from "../types";

export function useCandidateBrowser(initial: Results) {
  const [results, setResults] = useState(initial);
  const [index, setIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const cache = useRef(new Map([[initial.pagination.page, initial]]));
  useEffect(() => {
    request.current?.abort();
    cache.current = new Map([[initial.pagination.page, initial]]);
    setResults(initial);
    const selectedId = new URLSearchParams(window.location.search).get(
      "player",
    );
    const restored = initial.players.findIndex((p) => p.id === selectedId);
    setIndex(restored >= 0 ? restored : null);
    setBusy(false);
    setError(
      selectedId && restored < 0
        ? "The linked player is unavailable on this result page. Choose a player from the table."
        : "",
    );
    return () => request.current?.abort();
  }, [initial]);
  const loadPage = async (
    page: number,
    edge: "first" | "last" | null = null,
  ) => {
    if (busy || page < 1 || page > results.pagination.pages) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    try {
      const next =
        cache.current.get(page) ??
        (await searchPlayers({ ...initial.query, page }, controller.signal));
      if (controller.signal.aborted) return;
      cache.current.set(page, next);
      setResults(next);
      const index =
        edge === "first" ? 0 : edge === "last" ? next.players.length - 1 : null;
      setIndex(index);
      writeScoutUrl({
        page,
        player: index === null ? null : next.players[index].id,
        compare: null,
      });
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Unable to load players.");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };
  const start = (results.pagination.page - 1) * results.pagination.page_size;
  const rank = index === null ? null : start + index + 1;
  const move = (direction: -1 | 1) => {
    if (
      index === null ||
      busy ||
      (direction < 0 && rank === 1) ||
      (direction > 0 && rank === results.eligible)
    )
      return;
    const next = index + direction;
    if (next >= 0 && next < results.players.length) {
      setIndex(next);
      writeScoutUrl({
        page: results.pagination.page,
        player: results.players[next].id,
        compare: null,
      });
      setError("");
    } else
      void loadPage(
        results.pagination.page + direction,
        direction > 0 ? "first" : "last",
      );
  };
  const close = () => {
    request.current?.abort();
    setBusy(false);
    setError("");
    setIndex(null);
    writeScoutUrl({ player: null, compare: null });
  };
  return {
    results,
    selected: index === null ? null : results.players[index],
    rank,
    busy,
    error,
    select: (index: number) => {
      setIndex(index);
      writeScoutUrl({
        page: results.pagination.page,
        player: results.players[index].id,
        compare: null,
      });
    },
    move,
    close,
    loadPage,
  };
}
