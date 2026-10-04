import { Crosshair, ChartNoAxesCombined, Code2 } from "lucide-react";
import content from "../content/siteContent.json";
import { ExternalLink } from "./ExternalLink";

export function AboutPage() {
  return (
    <div className="info-page">
      <header className="info-hero">
        <span className="eyebrow">ABOUT SCOUTLENS</span>
        <h1>
          A clearer view.
          <br />
          <span>A better football conversation.</span>
        </h1>
        <p>
          From a recruitment brief to a shortlist you can explain. ScoutLens
          helps you explore players across Europe’s five major leagues, with the
          evidence behind every recommendation.
        </p>
      </header>
      <section className="info-section">
        <div>
          <span className="eyebrow">THE PROJECT</span>
          <h2>
            Start with the job.
            <br />
            Then find the player.
          </h2>
        </div>
        <div className="info-body">
          <p>
            Choose a club, select a position on the pitch and define the role.
            Refine your brief by age, minutes, preferred foot and market value,
            then explore the players whose recorded performance fits it.
          </p>
          <div className="about-features">
            <article>
              <Crosshair size={22} />
              <h3>A brief with context</h3>
              <p>
                Historical club formations and flexible pitch selection help you
                define what you need.
              </p>
            </article>
            <article>
              <ChartNoAxesCombined size={22} />
              <h3>Evidence you can inspect</h3>
              <p>
                Interactive graphs, exact numbers and side-by-side player
                comparisons reveal strengths and tradeoffs.
              </p>
            </article>
            <article>
              <Code2 size={22} />
              <h3>Transparent scoring</h3>
              <p>
                Explicit role weights and positional benchmarks make each score
                understandable.
              </p>
            </article>
          </div>
          <p>
            ScoutLens is an independent project built with React, TypeScript and
            FastAPI. It supports scouting research; watching matches and
            professional judgment remain part of evaluating a signing.
          </p>
          <ExternalLink href={content.repository}>
            Explore the source code
          </ExternalLink>
        </div>
      </section>
      <section className="info-section">
        <div>
          <span className="eyebrow">THE CREATOR</span>
          <h2>{content.creator}</h2>
        </div>
        <div className="info-body">
          <p>{content.intro}</p>
          <p>
            Have an idea, a data correction or an opportunity to work together?
            Get in touch.
          </p>
          <div className="contact-links">
            {content.contacts.map((c) => (
              <ExternalLink key={c.name} href={c.href}>
                {c.name}
              </ExternalLink>
            ))}
          </div>
          <span className="contact-email">workwithdilip1@gmail.com</span>
        </div>
      </section>
      <section className="info-section">
        <div>
          <span className="eyebrow">HELP IMPROVE IT</span>
          <h2>
            Good questions
            <br />
            make better scouting.
          </h2>
        </div>
        <div className="info-body">
          <p>
            Feedback on a role, an unexpected recommendation or a missing record
            is welcome. Include the season, club, role and player so the result
            can be reproduced.
          </p>
          <ExternalLink href={`${content.repository}/issues`}>
            Report an issue or suggest a feature
          </ExternalLink>
          <p className="info-caption">
            ScoutLens is not affiliated with Football Manager or the data
            providers credited on the Data page.
          </p>
        </div>
      </section>
    </div>
  );
}
