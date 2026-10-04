import { HeroPitch } from "./HeroPitch";
import {
  ArrowUpRight,
  Crosshair,
  ChartNoAxesCombined,
  ListFilter,
} from "lucide-react";
import type { Catalog } from "../types";

export function HomePage({
  catalog,
  onStart,
}: {
  catalog: Catalog | null;
  onStart: () => void;
}) {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-copy">
          <span className="eyebrow">
            <span className="live-dot" /> A CLEARER VIEW OF THE NEXT SIGNING
          </span>
          <h1>
            The right player.
            <br />
            <span>
              For your kind
              <br />
              of football.
            </span>
          </h1>
          <p>
            Start with your club. Define the job. Discover players whose
            recorded performance fits your recruitment brief.
          </p>
          <a
            className="primary home-cta"
            href="/scout"
            onClick={(e) => {
              if (
                !e.metaKey &&
                !e.ctrlKey &&
                !e.shiftKey &&
                !e.altKey &&
                e.button === 0
              ) {
                e.preventDefault();
                onStart();
              }
            }}
          >
            Open the scouting workspace <ArrowUpRight size={18} />
          </a>
          <span className="home-caption">
            Five leagues. Two seasons. Every score explained.
          </span>
        </div>
        <HeroPitch />
      </section>
      <div className="home-numbers">
        <div>
          <strong>5</strong>
          <span>European leagues</span>
        </div>
        <div>
          <strong>
            {catalog ? new Set(catalog.teams.map((t) => t.id)).size : "—"}
          </strong>
          <span>Clubs in the dataset</span>
        </div>
        <div>
          <strong>{catalog?.roles.length ?? "—"}</strong>
          <span>Scouting roles</span>
        </div>
        <div>
          <strong>2</strong>
          <span>Recorded seasons</span>
        </div>
      </div>
      <section className="home-workflow">
        <div>
          <span className="eyebrow">A RECRUITMENT BRIEF, MADE CLEAR</span>
          <h2>Go beyond a name on a list.</h2>
        </div>
        <article>
          <Crosshair size={23} />
          <h3>Start with the team</h3>
          <p>
            Use the club’s recorded formation or explore a different setup.
            Choose the position and role you need.
          </p>
        </article>
        <article>
          <ListFilter size={23} />
          <h3>Compare the candidates</h3>
          <p>
            Browse every eligible player in a ranked table. Refine age, minutes,
            foot, and market value.
          </p>
        </article>
        <article>
          <ChartNoAxesCombined size={23} />
          <h3>Understand the fit</h3>
          <p>
            Open a player’s full evidence profile. Compare strengths, tradeoffs,
            and the club’s current profile.
          </p>
        </article>
      </section>
      <p className="home-data-note">
        Built on recorded performance from 2024–25 and 2025–26. Fit scores
        support exploration; formation alone does not establish tactical
        suitability.
      </p>
    </div>
  );
}
