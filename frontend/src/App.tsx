import { useScoutingState } from "./lib/useScoutingState";
import { TeamCharts } from "./components/TeamCharts";
import { ShortlistChart } from "./components/ShortlistChart";
import { useEffect, useState } from "react";
import { ShieldCheck, Search, Users } from "lucide-react";
import { Brand } from "./components/Brand";
import { SearchPanel } from "./components/SearchPanel";
import { CandidateTable } from "./components/CandidateTable";
import { HomePage } from "./components/HomePage";
import { Methodology } from "./components/Methodology";
import { AboutPage } from "./components/AboutPage";
import { DataPage } from "./components/DataPage";
import { usePageMetadata } from "./lib/usePageMetadata";
import { SiteAnalytics } from "./components/SiteAnalytics";
export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  usePageMetadata(path);
  const navigate = (next: string) => {
    if (window.location.pathname !== next)
      window.history.pushState({}, "", next);
    setPath(next);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const link = (e: React.MouseEvent<HTMLAnchorElement>, next: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    e.preventDefault();
    navigate(next);
  };
  const {
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
  } = useScoutingState();
  return (
    <>
      <SiteAnalytics path={path} />
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(e) => link(e, "/")}
          aria-label="ScoutLens home"
        >
          <Brand />
        </a>
        <span className="nav-label">RECRUITMENT INTELLIGENCE</span>
        <nav className="site-nav" aria-label="Main navigation">
          <a
            href="/"
            aria-current={path === "/" ? "page" : undefined}
            onClick={(e) => link(e, "/")}
          >
            Home
          </a>
          <a
            href="/scout"
            aria-current={path === "/scout" ? "page" : undefined}
            onClick={(e) => link(e, "/scout")}
          >
            Scouting
          </a>
          {[
            ["/about", "About"],
            ["/data", "Data"],
          ].map(([href, name]) => (
            <a
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              onClick={(e) => link(e, href)}
            >
              {name}
            </a>
          ))}
        </nav>
      </header>
      <main>
        {path === "/about" ? (
          <AboutPage />
        ) : path === "/data" ? (
          <DataPage />
        ) : path === "/" ? (
          <HomePage catalog={catalog} onStart={() => navigate("/scout")} />
        ) : path === "/scout" ? (
          <>
            <section className="scouting-intro">
              <span className="eyebrow">SCOUTING WORKSPACE</span>
              <h1>Build your next signing.</h1>
              <p>
                Define the brief. Compare the players. Explore the evidence.
              </p>
            </section>
            {error && (
              <div className="error" role="alert">
                {error}
                <button onClick={() => (catalog ? void search() : void load())}>
                  Try again
                </button>
              </div>
            )}
            {!catalog || !query ? (
              <div className="loading" role="status">
                {error
                  ? "The API is unavailable. Start the FastAPI server to load ScoutLens."
                  : "Loading the scouting database…"}
              </div>
            ) : (
              <>
                <div className="workspace">
                  <SearchPanel
                    catalog={catalog}
                    query={query}
                    setQuery={changeQuery}
                    league={league}
                    setLeague={setLeague}
                    busy={busy}
                    onSearch={() => void search()}
                  />
                  <section
                    className="results"
                    aria-busy={busy}
                    aria-label="Player recommendations"
                  >
                    <div className="results-heading">
                      <div>
                        <span className="eyebrow">YOUR SHORTLIST</span>
                        <h2>
                          {results
                            ? `${results.team.name} · ${catalog.roles.find((r) => r.id === results.query.role)?.name}`
                            : "A better starting eleven starts with a brief."}
                        </h2>
                      </div>
                      <span className="season-badge">
                        {
                          catalog.seasons.find((s) => s.id === query.season)
                            ?.name
                        }
                      </span>
                    </div>
                    {busy ? (
                      <div className="empty-state" role="status">
                        <Search size={32} />
                        <h3>Evaluating the evidence…</h3>
                        <p>Comparing role metrics across the five leagues.</p>
                      </div>
                    ) : results ? (
                      <>
                        <div className="result-meta">
                          <span>
                            <Users size={14} />
                            {results.eligible} eligible players · Select a row
                            to explore
                          </span>
                          <span>
                            {results.formation
                              ? `${results.formation} planning context`
                              : "No formation recorded"}
                          </span>
                        </div>
                        {results.players.length ? (
                          <CandidateTable results={results} />
                        ) : (
                          <div className="empty-state">
                            <Search size={32} />
                            <h3>No players meet this brief.</h3>
                            <p>
                              Try increasing the age or market-value ceiling, or
                              reducing the minutes requirement.
                            </p>
                          </div>
                        )}
                        <TeamCharts results={results} />
                        {results.players.length > 0 && (
                          <details className="comparison-disclosure">
                            <summary>
                              Compare the first five players on this page
                            </summary>
                            <ShortlistChart results={results} />
                          </details>
                        )}
                        <p className="results-note">
                          {results.excluded.missing_metrics} position-eligible
                          records excluded for missing role metrics. Players at
                          the destination club are excluded.
                        </p>
                      </>
                    ) : (
                      <div className="empty-state">
                        <div className="pitch" aria-hidden="true">
                          <div className="pitch-circle" />
                          <i className="marker one" />
                          <i className="marker two" />
                          <i className="marker three" />
                          <i className="marker four" />
                          <i className="marker five" />
                        </div>
                        <h3>Build your recruitment brief.</h3>
                        <p>
                          Select a club and a role, then find players whose
                          <br className="desktop-break" /> recorded performance
                          matches the job.
                        </p>
                        <span className="empty-caption">
                          <ShieldCheck size={14} /> Real data. No invented
                          player ratings.
                        </span>
                      </div>
                    )}
                  </section>
                </div>
                <div id="methodology">
                  <Methodology catalog={catalog} />
                </div>
              </>
            )}
          </>
        ) : (
          <section className="info-hero">
            <h1>Page not found.</h1>
            <a className="text-link" href="/" onClick={(e) => link(e, "/")}>
              Return home
            </a>
          </section>
        )}
        <footer>
          <span>ScoutLens · A clearer view of the next signing.</span>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="/about" onClick={(e) => link(e, "/about")}>
              About
            </a>
            <a href="/data" onClick={(e) => link(e, "/data")}>
              Data & methodology
            </a>
            <a
              href="https://github.com/dilipBadal/ScoutLense"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code
            </a>
          </nav>
        </footer>
      </main>
    </>
  );
}
