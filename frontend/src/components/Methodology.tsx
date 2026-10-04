import type { Catalog } from "../types";
export function Methodology({ catalog }: { catalog: Catalog }) {
  return (
    <details className="methodology">
      <summary>How ScoutLens evaluates fit</summary>
      <div className="method-grid">
        <div>
          <h3>Transparent by design</h3>
          <p>
            The ranking combines 90% role percentiles with 10% similarity in
            team possession. This is an initial heuristic, not a probability of
            signing success. Goalkeepers use role metrics alone. Formation is
            context only.
          </p>
          <p>
            Club charts show incumbent performance, not an ideal target.
            Benchmarks use the same position with at least 900 minutes.
            Candidates must have every required role metric. Each source uses
            its own recorded minutes for per-90 rates.
          </p>
        </div>
        <div>
          <h3>Know the limits</h3>
          <ul>
            {catalog.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p>
            Snapshot prepared {catalog.prepared_at}. Unresolved metadata:{" "}
            {catalog.report.unresolved_metadata}. Conflicting source records are
            quarantined.
          </p>
        </div>
      </div>
      <div className="role-weights">
        {catalog.roles.map((r) => (
          <div key={r.id}>
            <h3>{r.name}</h3>
            {Object.entries(r.weights).map(([key, weight]) => (
              <p key={key}>
                {catalog.metrics[key][0]}{" "}
                <strong>{Math.round(weight * 100)}%</strong>
              </p>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}
