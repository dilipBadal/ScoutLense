/** Familiar abbreviations and short lines keep radar axes readable at small sizes. */
const radarLabels: Record<string, string[]> = {
  npxg: ["npxG"],
  xa: ["xA"],
  passes: ["Completed", "passes"],
  pass_accuracy: ["Pass accuracy"],
  final_third_passes: ["Final-third", "passes"],
  big_chances: ["Big chances", "created"],
  aerial_win: ["Aerial duels", "won (%)"],
  aerials: ["Aerial duels", "won"],
  ground_win: ["Ground duels", "won (%)"],
  long_accuracy: ["Long-ball", "accuracy"],
  save_pct: ["Save percentage", "(proxy)"],
  sweeps: ["Successful", "runs out"],
  dribbles: ["Successful", "dribbles"],
};
export function radarMetricLabel(key: string, fullLabel: string): string[] {
  if (radarLabels[key]) return radarLabels[key];
  const lines: string[] = [];
  for (const word of fullLabel.split(/\s+/)) {
    const last = lines.length - 1;
    if (last >= 0 && `${lines[last]} ${word}`.length <= 15)
      lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}
