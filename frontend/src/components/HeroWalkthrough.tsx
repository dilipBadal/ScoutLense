import { Check, Pause, Play } from "lucide-react";
import { pitchFormation } from "../lib/formations";
import { useHeroWalkthrough } from "../lib/useHeroWalkthrough";
import example from "../content/heroExample.json";
import { PitchMarkings } from "./PitchMarkings";
import { PlayerAvatar } from "./PlayerAvatar";
import { HeroEvidence } from "./HeroEvidence";
const scenes = ["Build the brief", "Find a player", "Explore the evidence"];

export function HeroWalkthrough() {
  const demo = useHeroWalkthrough();
  const shape = demo.tick === 0 ? "4-3-3" : "4-2-3-1";
  return (
    <div
      className="hero-walkthrough"
      ref={demo.container}
      data-manual={demo.manual || demo.reduced}
    >
      <div className="walkthrough-heading">
        <span className="eyebrow">EXAMPLE SCOUTING WORKFLOW</span>
        <span>0{demo.scene + 1} / 03</span>
      </div>
      <div className="walkthrough-stage">
        <section
          className="demo-scene demo-brief"
          data-active={demo.scene === 0}
          aria-hidden={demo.scene !== 0}
          inert={demo.scene !== 0}
        >
          <div className="demo-scene-heading">
            <span>
              {example.team} · {example.season}
            </span>
            <h3>Choose the shape. Define the job.</h3>
          </div>
          <div className="demo-formation-options">
            {["4-3-3", "4-2-3-1"].map((f) => (
              <span data-selected={shape === f} key={f}>
                {f}
              </span>
            ))}
          </div>
          <div className="demo-pitch hero-pitch">
            <PitchMarkings />
            {["4-3-3", "4-2-3-1"].map((f) => (
              <div
                className="demo-pitch-layout"
                key={f}
                data-active={shape === f}
                aria-hidden={shape !== f}
              >
                {pitchFormation(f)!.slots.map((slot) => (
                  <span
                    className="hero-player"
                    key={slot.id}
                    data-selected={demo.tick > 0 && slot.position === "ST"}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                  >
                    {demo.tick > 0 && slot.position === "ST" ? (
                      <Check size={15} />
                    ) : (
                      slot.short
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="demo-brief-label">
            <span>
              {demo.tick === 0
                ? "Select your formation"
                : "Position selected: striker"}
            </span>
            <strong>
              {demo.tick === 0
                ? "Eleven places. Your next signing."
                : "Role: Goalscorer"}
            </strong>
          </div>
        </section>
        <section
          className="demo-scene demo-shortlist"
          data-active={demo.scene === 1}
          aria-hidden={demo.scene !== 1}
          inert={demo.scene !== 1}
        >
          <div className="demo-scene-heading">
            <span>
              {example.team} · ST · {example.role}
            </span>
            <h3>A shortlist built around the role.</h3>
          </div>
          <div className="demo-table-heading">
            <span>PLAYER</span>
            <span>FIT / 100</span>
          </div>
          {example.players.map((p, i) => (
            <div
              className="demo-candidate"
              key={p.id}
              data-selected={demo.tick === 3 && i === 0}
            >
              <span className="demo-rank">0{i + 1}</span>
              <PlayerAvatar id={p.id} name={p.name} size={48} />
              <div>
                <strong>{p.name}</strong>
                <span>{p.team}</span>
              </div>
              <b>{p.score}</b>
              {demo.tick === 3 && i === 0 && (
                <Check className="demo-selected-check" size={16} />
              )}
            </div>
          ))}
          <div className="demo-selection-caption">
            <span className="eyebrow">
              {demo.tick === 3 ? "PLAYER SELECTED" : "MATCHING THE BRIEF"}
            </span>
            <h4>
              {demo.tick === 3
                ? "Harry Kane. Let’s look closer."
                : "Different players. The same benchmark."}
            </h4>
            <p>
              Recorded performance, weighted for the role.
              <br />
              Open a player to understand the fit.
            </p>
          </div>
        </section>
        <section
          className="demo-scene"
          data-active={demo.scene === 2}
          aria-hidden={demo.scene !== 2}
          inert={demo.scene !== 2}
        >
          <div className="demo-scene-heading">
            <span>{example.season} · recorded performance</span>
            <h3>The numbers behind the fit.</h3>
          </div>
          <HeroEvidence />
        </section>
      </div>
      <div className="walkthrough-controls">
        <div role="group" aria-label="Walkthrough scenes">
          {scenes.map((name, i) => (
            <button
              type="button"
              key={name}
              aria-label={name}
              aria-pressed={demo.scene === i}
              onClick={() => demo.select(i)}
            >
              <span>0{i + 1}</span>
              <span className="scene-control-label">{name}</span>
            </button>
          ))}
        </div>
        <button
          className="demo-playback"
          type="button"
          onClick={demo.toggle}
          disabled={demo.reduced}
          aria-label={
            demo.reduced
              ? "Autoplay disabled for reduced motion"
              : demo.stopped
                ? "Play walkthrough"
                : "Pause walkthrough"
          }
        >
          {demo.stopped ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
      <p className="walkthrough-footnote">
        {demo.reduced ? "Select a scene to explore · " : ""}Illustrative brief ·
        real snapshot values · fit is not a success prediction.
      </p>
    </div>
  );
}
