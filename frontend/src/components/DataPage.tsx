import content from "../content/siteContent.json";
import snapshot from "../content/snapshot.json";
import { ExternalLink } from "./ExternalLink";

export function DataPage() {
  return (
    <div className="info-page">
      <header className="info-hero">
        <span className="eyebrow">DATA & METHODOLOGY</span>
        <h1>
          Know what’s
          <br />
          <span>behind the recommendation.</span>
        </h1>
        <p>
          The sources, preparation choices and limits behind ScoutLens. Every
          fit score starts with recorded performance, and every dataset has a
          boundary.
        </p>
      </header>
      <div className="data-snapshot" aria-label="Deployed dataset coverage">
        {[
          ["Players", snapshot.players.toLocaleString()],
          ["Player–club season records", snapshot.spells.toLocaleString()],
          ["Clubs", snapshot.clubs],
          ["Matched portraits", snapshot.faces.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="snapshot-caption">
        Prepared {snapshot.prepared_at} · 2024/25 & 2025/26 · Premier League, La
        Liga, Serie A, Bundesliga & Ligue 1. Counts describe the prepared
        snapshot, before role and minutes filters.
      </p>
      <section className="info-section" id="sources">
        <div>
          <span className="eyebrow">SOURCE REGISTER</span>
          <h2>Where it comes from.</h2>
          <p className="info-caption">
            Source and license links checked 4 October 2026. License statements
            describe the source publishers’ terms.
          </p>
        </div>
        <div className="source-register">
          {content.sources.map((source) => (
            <article className="source-entry" key={source.name}>
              <h3>{source.name}</h3>
              <span className="source-by">{source.by}</span>
              <p>{source.use}</p>
              <div className="license-note">
                <strong>License & rights</strong>
                <p>{source.license}</p>
              </div>
              <div className="source-links">
                {source.links.map((link) => (
                  <ExternalLink key={link.name} href={link.href}>
                    {link.name}
                  </ExternalLink>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="info-section" id="methodology">
        <div>
          <span className="eyebrow">FROM RECORD TO RANKING</span>
          <h2>
            How we prepare
            <br />
            and score the data.
          </h2>
        </div>
        <ol className="method-steps">
          {content.method.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="info-section">
        <div>
          <span className="eyebrow">QUALITY CHECKS</span>
          <h2>
            Coverage is part
            <br />
            of the evidence.
          </h2>
        </div>
        <div className="info-body">
          <p>
            {snapshot.report.unresolved_metadata} source records were excluded
            because metadata could not be uniquely linked. Minute conflicts
            quarantined {snapshot.report.sofascore_minutes_quarantined}{" "}
            SofaScore matches and{" "}
            {snapshot.report.understat_minutes_quarantined} Understat matches.
          </p>
          <p>
            Verified source joins:{" "}
            {snapshot.report.sofascore_matched.toLocaleString()} SofaScore and{" "}
            {snapshot.report.understat_matched.toLocaleString()} Understat
            records. These counts overlap and do not imply that every player has
            every required statistic.
          </p>
          <p>{content.unused}</p>
        </div>
      </section>
      <section className="info-section" id="limitations">
        <div>
          <span className="eyebrow">READ THE SCORE IN CONTEXT</span>
          <h2>
            What the data
            <br />
            cannot tell you.
          </h2>
        </div>
        <ul className="data-limits">
          {content.limits.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </section>
      <section className="info-section">
        <div>
          <span className="eyebrow">ATTRIBUTION & CORRECTIONS</span>
          <h2>Credit to the sources.</h2>
        </div>
        <div className="info-body">
          <p>
            Football data and photographs remain subject to their original
            rights. ScoutLens does not grant a blanket license to the combined
            dataset. Public source code and third-party data have separate
            licensing terms.
          </p>
          <div className="source-links">
            <ExternalLink
              href={`${content.repository}/blob/main/scripts/prepare_data.py`}
            >
              Preparation script
            </ExternalLink>
            <ExternalLink href="mailto:workwithdilip1@gmail.com">
              Request a correction or discuss attribution
            </ExternalLink>
          </div>
        </div>
      </section>
    </div>
  );
}
