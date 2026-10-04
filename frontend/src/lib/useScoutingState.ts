import { useEffect, useRef, useState } from "react";
import { getCatalog, searchPlayers } from "../api";
import type { Catalog, Query, Results } from "../types";
import { briefToUrl, queryFromUrl } from "./scoutUrl";

export function useScoutingState() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [query, setQuery] = useState<Query | null>(null);
  const [league, setLeague] = useState("ENG-Premier League");
  const [results, setResults] = useState<Results | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);
  const run = async (next: Query) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true);
    setError("");
    setResults(null);
    try {
      const data = await searchPlayers(next, controller.signal);
      if (!controller.signal.aborted) setResults(data);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Unable to load candidates.");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };
  const restore = (data: Catalog) => {
    const next = queryFromUrl(data);
    setQuery(next);
    setLeague(
      data.teams.find((t) => t.id === next.team_id && t.season === next.season)!
        .league,
    );
    if (
      window.location.pathname === "/scout" &&
      new URLSearchParams(window.location.search).has("results")
    )
      void run(next);
    else {
      abort.current?.abort();
      setBusy(false);
      setResults(null);
      setError("");
    }
  };
  const load = async () => {
    setError("");
    try {
      const data = await getCatalog();
      setCatalog(data);
      restore(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load the data.");
    }
  };
  useEffect(() => {
    void load();
    return () => abort.current?.abort();
  }, []);
  useEffect(() => {
    if (!catalog) return;
    const onPop = () => restore(catalog);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [catalog]);
  const search = async () => {
    if (query) {
      briefToUrl(query, true);
      await run({ ...query, page: 1 });
    }
  };
  const changeQuery = (next: Query) => {
    abort.current?.abort();
    setBusy(false);
    setQuery({ ...next, page: 1 });
    setResults(null);
    setError("");
    briefToUrl(next, false);
  };
  return {
    catalog,
    query,
    league,
    setLeague,
    results,
    busy,
    error,
    load,
    search,
    changeQuery,
  };
}
