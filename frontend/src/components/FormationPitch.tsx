import { PitchMarkings } from "./PitchMarkings";
import { useId } from "react";
import type { PitchFormation, PitchSlot } from "../lib/formations";
export function FormationPitch({
  formation,
  activeId,
  onSelect,
}: {
  formation: PitchFormation;
  activeId: string | null;
  onSelect: (slot: PitchSlot) => void;
}) {
  const id = useId();
  return (
    <div className="formation-picker">
      <div className="pitch-heading">
        <span id={id}>Choose a place in the XI</span>
        <span>Attack ↑</span>
      </div>
      <div className="formation-pitch" role="group" aria-labelledby={id}>
        <PitchMarkings />
        {formation.slots.map((slot) => (
          <button
            type="button"
            key={slot.id}
            className="pitch-slot"
            aria-label={`Select ${slot.label}`}
            aria-pressed={activeId === slot.id}
            title={slot.label}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            onClick={() => onSelect(slot)}
          >
            <span>{slot.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
