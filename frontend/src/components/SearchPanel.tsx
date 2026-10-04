import { PositionPicker } from "./PositionPicker";
import { PanelLeftClose, SlidersHorizontal } from "lucide-react";
import type { Catalog, Query } from "../types";
import { Select } from "./Select";
export function SearchPanel({
  catalog,
  query,
  setQuery,
  league,
  setLeague,
  busy,
  onSearch,
  onCollapse,
  dirty,
}: {
  catalog: Catalog;
  query: Query;
  setQuery: (query: Query) => void;
  league: string;
  setLeague: (league: string) => void;
  busy: boolean;
  onSearch: () => void;
  onCollapse?: () => void;
  dirty: boolean;
}) {
  const clubs = catalog.teams.filter(
    (t) => t.league === league && t.season === query.season,
  );
  const club = clubs.find((t) => t.id === query.team_id);
  const update = (patch: Partial<Query>) => setQuery({ ...query, ...patch });
  const changeLeague = (next: string) => {
    setLeague(next);
    update({
      team_id: catalog.teams.find(
        (t) => t.league === next && t.season === query.season,
      )!.id,
      formation: null,
    });
  };
  return (
    <aside className="search-panel">
      <div className="panel-heading">
        <SlidersHorizontal size={16} />
        <span>Recruitment brief</span>
        {onCollapse && (
          <button
            type="button"
            className="icon-button"
            onClick={onCollapse}
            aria-label="Collapse recruitment filters"
            title="Collapse filters"
          >
            <PanelLeftClose size={17} />
          </button>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <div className="brief-fields">
          <Select
            label="Season"
            value={query.season}
            onChange={(season) =>
              update({
                season,
                team_id: catalog.teams.find(
                  (t) => t.league === league && t.season === season,
                )!.id,
                formation: null,
              })
            }
          >
            {catalog.seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select label="League" value={league} onChange={changeLeague}>
            {catalog.leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          <Select
            label="Destination club"
            value={query.team_id}
            onChange={(team_id) => update({ team_id, formation: null })}
          >
            {clubs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <div className="club-context">
            <span>Season possession</span>
            <strong>{club?.possession?.toFixed(1) ?? "—"}%</strong>
            <small>
              {club?.formations[0]
                ? `${club.formations[0].name} · ${club.formations[0].matches} recorded matches`
                : "Formation history unavailable"}
            </small>
          </div>
          <PositionPicker
            catalog={catalog}
            query={query}
            club={club}
            onChange={update}
          />
          <details className="filters">
            <summary>
              Refine your search <span>+</span>
            </summary>
            <div className="filter-content">
              <label className="field">
                <span>Maximum age · {query.max_age}</span>
                <input
                  type="range"
                  min="16"
                  max="45"
                  value={query.max_age}
                  onChange={(e) => update({ max_age: Number(e.target.value) })}
                />
              </label>
              <Select
                label="Minimum minutes"
                value={String(query.min_minutes)}
                onChange={(v) => update({ min_minutes: Number(v) })}
              >
                {[450, 900, 1800, 2700].map((v) => (
                  <option key={v} value={v}>
                    {v.toLocaleString()} minutes
                  </option>
                ))}
              </Select>
              <Select
                label="Preferred foot"
                value={query.foot}
                onChange={(foot) => update({ foot })}
              >
                {["any", "left", "right", "both"].map((v) => (
                  <option key={v} value={v}>
                    {v === "any" ? "Any foot" : v[0].toUpperCase() + v.slice(1)}
                  </option>
                ))}
              </Select>
              <Select
                label="Market-value ceiling"
                value={query.max_value === null ? "" : String(query.max_value)}
                onChange={(v) => update({ max_value: v ? Number(v) : null })}
              >
                <option value="">No ceiling</option>
                {[5000000, 15000000, 30000000, 60000000].map((v) => (
                  <option key={v} value={v}>
                    €{v / 1000000}m
                  </option>
                ))}
              </Select>
              <p className="field-help">
                Formation sets planning context. It does not change the
                statistical score. Unknown valuations are excluded when a
                ceiling is set.
              </p>
            </div>
          </details>
        </div>
        <div className="brief-actions">
          {dirty && (
            <p className="brief-pending" role="status">
              Brief changed · apply to update results
            </p>
          )}
          <button className="primary" disabled={busy} type="submit">
            {busy ? "Finding candidates…" : "Find best fits"}
          </button>
          <p className="form-note">
            Five leagues. Real records. Explained rankings.
          </p>
        </div>
      </form>
    </aside>
  );
}
