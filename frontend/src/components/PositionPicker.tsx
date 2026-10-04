import { useState } from "react";
import type { Catalog, Query, Team } from "../types";
import {
  formationShape,
  pitchFormation,
  PLANNING_FORMATIONS,
} from "../lib/formations";
import { Dialog } from "./Dialog";
import { FormationPitch } from "./FormationPitch";
import { Select } from "./Select";
export function PositionPicker({
  catalog,
  query,
  club,
  onChange,
}: {
  catalog: Catalog;
  query: Query;
  club?: Team;
  onChange: (patch: Partial<Query>) => void;
}) {
  const [pitchOpen, setPitchOpen] = useState(false);
  const recorded = club?.formations[0];
  const displayedFormation = query.formation ?? recorded?.name ?? null;
  const formation = pitchFormation(displayedFormation);
  const context = `${query.team_id}|${query.season}|${displayedFormation}`;
  const [selection, setSelection] = useState<{
    context: string;
    position: string;
    slot: string | null;
  } | null>(null);
  const activeId =
    selection?.context === context && selection.position === query.position
      ? selection.slot
      : (formation?.slots.find((s) => s.position === query.position)?.id ??
        null);
  const activeSlot = formation?.slots.find((s) => s.id === activeId);
  const role = catalog.roles.find((r) => r.id === query.role)!;
  const choosePosition = (position: string, slot: string | null) => {
    setSelection({ context, position, slot });
    const fallback = catalog.roles.find((r) => r.positions.includes(position))!;
    onChange({
      position,
      role: role.positions.includes(position) ? role.id : fallback.id,
    });
  };
  const counts = new Map<string, number>();
  club?.formations.forEach((f) => {
    const shape = formationShape(f.name);
    if (shape) counts.set(shape, (counts.get(shape) ?? 0) + f.matches);
  });
  const alternatives = new Map(
    [...counts].map(([shape, matches]) => [
      shape,
      `${shape} · recorded (${matches} ${matches === 1 ? "match" : "matches"})`,
    ]),
  );
  PLANNING_FORMATIONS.forEach((shape) => {
    if (!alternatives.has(shape)) alternatives.set(shape, shape);
  });
  return (
    <section
      className="position-picker"
      aria-label="Choose a formation position and role"
    >
      <button
        type="button"
        className="pitch-picker-trigger"
        onClick={() => setPitchOpen(true)}
      >
        <span>
          <strong>{displayedFormation ?? "Choose formation"}</strong>
          <small>
            {activeSlot?.label ?? query.position} · {role.name}
          </small>
        </span>
        <span className="pitch-trigger-action">Choose on pitch</span>
      </button>
      <Dialog
        open={pitchOpen}
        onClose={() => setPitchOpen(false)}
        title="Choose a position"
        className="pitch-dialog"
      >
        <div className="pitch-dialog-body">
          <div className="pitch-dialog-field">
            {formation ? (
              <FormationPitch
                formation={formation}
                activeId={activeId}
                onSelect={(slot) => {
                  choosePosition(slot.position, slot.id);
                  setPitchOpen(false);
                }}
              />
            ) : (
              <p className="pitch-unavailable">
                {displayedFormation
                  ? "This recorded formation has no pitch template yet."
                  : "No formation history is available."}{" "}
                Choose a planning formation, or close this panel and use the
                position dropdown.
              </p>
            )}
          </div>
          <div className="pitch-dialog-options">
            <span className="eyebrow">
              {club?.name ?? "Planning formation"}
            </span>
            <Select
              label="Formation on pitch"
              value={query.formation ?? ""}
              onChange={(value) => onChange({ formation: value || null })}
            >
              <option value="">
                {recorded
                  ? `Club default · ${recorded.name}`
                  : "No club formation recorded"}
              </option>
              {[...alternatives].map(([shape, label]) => (
                <option key={shape} value={shape}>
                  {label}
                </option>
              ))}
            </Select>
            <p className="pitch-selection" aria-live="polite">
              {activeSlot
                ? `Selected slot: ${activeSlot.label}`
                : `Custom position: ${catalog.positions.find((p) => p.id === query.position)?.name}`}
            </p>
            <p className="pitch-caption">
              {query.formation
                ? "Planning formation selected."
                : recorded
                  ? `${recorded.matches} recorded league matches used this formation in ${catalog.seasons.find((s) => s.id === query.season)?.name}.`
                  : ""}{" "}
              Slots are schematic; wide midfield slots can represent wing-backs.
              Edit the position or role freely.
            </p>
            <p className="field-help">
              Select a circle to choose your position. Then choose its role in
              the recruitment brief.
            </p>
          </div>
        </div>
      </Dialog>
      <Select
        label="Position"
        value={query.position}
        onChange={(position) => choosePosition(position, null)}
      >
        {catalog.positions.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Select
        label="Player role"
        value={query.role}
        onChange={(role) => onChange({ role })}
      >
        {catalog.roles
          .filter((r) => r.positions.includes(query.position))
          .map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
      </Select>
      <p className="field-help">{role.description}</p>
    </section>
  );
}
