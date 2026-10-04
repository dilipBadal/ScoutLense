/** Schematic recruitment slots, not observed player locations or tracking data. */
export type PitchSlot = {
  id: string;
  position: string;
  label: string;
  short: string;
  x: number;
  y: number;
};
export type PitchFormation = {
  name: string;
  shape: string;
  slots: PitchSlot[];
};
export const PLANNING_FORMATIONS = [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "4-1-4-1",
  "4-1-2-1-2",
  "4-3-1-2",
  "4-4-1-1",
  "4-5-1",
  "3-4-3",
  "3-4-2-1",
  "3-4-1-2",
  "3-5-2",
  "3-1-4-2",
  "5-3-2",
  "5-4-1",
  "4-1-5",
];
const LINES: Record<string, string[][]> = {
  "4-3-3": [
    ["LB", "CB", "CB", "RB"],
    ["CM", "DM", "CM"],
    ["LW", "ST", "RW"],
  ],
  "4-2-3-1": [
    ["LB", "CB", "CB", "RB"],
    ["DM", "DM"],
    ["LW", "AM", "RW"],
    ["ST"],
  ],
  "4-4-2": [
    ["LB", "CB", "CB", "RB"],
    ["LM", "CM", "CM", "RM"],
    ["ST", "ST"],
  ],
  "4-1-4-1": [
    ["LB", "CB", "CB", "RB"],
    ["DM"],
    ["LM", "CM", "CM", "RM"],
    ["ST"],
  ],
  "4-1-2-1-2": [
    ["LB", "CB", "CB", "RB"],
    ["DM"],
    ["CM", "CM"],
    ["AM"],
    ["ST", "ST"],
  ],
  "4-3-1-2": [
    ["LB", "CB", "CB", "RB"],
    ["CM", "DM", "CM"],
    ["AM"],
    ["ST", "ST"],
  ],
  "4-4-1-1": [
    ["LB", "CB", "CB", "RB"],
    ["LM", "CM", "CM", "RM"],
    ["SS"],
    ["ST"],
  ],
  "4-5-1": [["LB", "CB", "CB", "RB"], ["LM", "CM", "DM", "CM", "RM"], ["ST"]],
  "3-4-3": [
    ["CB", "CB", "CB"],
    ["LM", "CM", "CM", "RM"],
    ["LW", "ST", "RW"],
  ],
  "3-4-2-1": [
    ["CB", "CB", "CB"],
    ["LM", "CM", "CM", "RM"],
    ["AM", "AM"],
    ["ST"],
  ],
  "3-4-1-2": [
    ["CB", "CB", "CB"],
    ["LM", "CM", "CM", "RM"],
    ["AM"],
    ["ST", "ST"],
  ],
  "3-5-2": [
    ["CB", "CB", "CB"],
    ["LM", "CM", "DM", "CM", "RM"],
    ["ST", "ST"],
  ],
  "3-1-4-2": [
    ["CB", "CB", "CB"],
    ["DM"],
    ["LM", "CM", "CM", "RM"],
    ["ST", "ST"],
  ],
  "5-3-2": [
    ["LB", "CB", "CB", "CB", "RB"],
    ["CM", "DM", "CM"],
    ["ST", "ST"],
  ],
  "5-4-1": [["LB", "CB", "CB", "CB", "RB"], ["LM", "CM", "CM", "RM"], ["ST"]],
  "4-1-5": [["LB", "CB", "CB", "RB"], ["DM"], ["LW", "SS", "ST", "SS", "RW"]],
};
const NAMES: Record<string, string> = {
  GK: "Goalkeeper",
  CB: "Centre-back",
  LB: "Left-back",
  RB: "Right-back",
  DM: "Defensive midfield",
  CM: "Central midfield",
  AM: "Attacking midfield",
  LM: "Left midfield / wing-back",
  RM: "Right midfield / wing-back",
  LW: "Left wing",
  RW: "Right wing",
  SS: "Second striker",
  ST: "Centre-forward",
};
export function formationShape(name: string): string | null {
  if (name === "4-4-2 Diamond") return "4-1-2-1-2";
  const shape = name.match(/^\d+(?:-\d+)+/)?.[0];
  return shape && LINES[shape] ? shape : null;
}
export function pitchFormation(name: string | null): PitchFormation | null {
  if (!name) return null;
  const shape = formationShape(name);
  if (!shape) return null;
  const lines = LINES[shape];
  const slots: PitchSlot[] = [
    {
      id: "keeper",
      position: "GK",
      short: "GK",
      label: "Goalkeeper",
      x: 50,
      y: 92,
    },
  ];
  lines.forEach((line, row) => {
    line.forEach((position, index) => {
      const repeats = line.filter((p) => p === position).length;
      const side =
        repeats === 1
          ? ""
          : index < (line.length - 1) / 2
            ? "Left "
            : index > (line.length - 1) / 2
              ? "Right "
              : "Central ";
      slots.push({
        id: `${row}:${index}`,
        position,
        short:
          side &&
          side !== "Central " &&
          ["CB", "ST", "CM", "DM", "AM", "SS"].includes(position)
            ? `${side[0]}${position}`
            : position,
        label: `${side}${NAMES[position]}`,
        x: line.length === 1 ? 50 : 9 + (index * 82) / (line.length - 1),
        y: 78 - (row * 60) / (lines.length - 1),
      });
    });
  });
  return { name, shape, slots };
}
