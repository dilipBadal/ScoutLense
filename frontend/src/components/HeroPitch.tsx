import { pitchFormation } from "../lib/formations";
import { PitchMarkings } from "./PitchMarkings";

const formation = pitchFormation("4-3-3")!;

export function HeroPitch() {
  return (
    <figure
      className="hero-formation"
      aria-label="4–3–3 formation: goalkeeper, four defenders, three midfielders and three forwards"
    >
      <figcaption>
        <span>4–3–3</span>
        <span>Attack ↑</span>
      </figcaption>
      <div className="hero-pitch">
        <PitchMarkings />
        {formation.slots.map((slot) => (
          <span
            className="hero-player"
            key={slot.id}
            title={slot.label}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            {slot.short}
          </span>
        ))}
      </div>
    </figure>
  );
}
