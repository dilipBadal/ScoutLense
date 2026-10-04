import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pitchFormation, PLANNING_FORMATIONS } from '../frontend/src/lib/formations.ts';
const snapshot = JSON.parse(readFileSync(new URL('../backend/assets/scoutlens.json', import.meta.url)));
const positions = new Set(snapshot.players.flatMap(p => p.positions));
test('every recorded and planning shape has eleven distinct valid slots', () => {
  const names = new Set([...PLANNING_FORMATIONS, ...snapshot.teams.flatMap(t => t.formations.map(f => f.name))]);
  for (const name of names) {
    const formation = pitchFormation(name);
    assert.ok(formation, name);
    assert.equal(formation.slots.length, 11, name);
    assert.equal(new Set(formation.slots.map(s => s.id)).size, 11, name);
    assert.equal(new Set(formation.slots.map(s => s.label)).size, 11, name);
    assert.equal(formation.slots.filter(s => s.position === 'GK').length, 1);
    assert.equal(formation.shape.split('-').reduce((n, v) => n + Number(v), 0), 10);
    for (const slot of formation.slots) {
      assert.ok(positions.has(slot.position), slot.position);
      assert.ok(slot.x >= 9 && slot.x <= 91 && slot.y >= 18 && slot.y <= 92);
    }
  }
});
test('unavailable formation is not silently fabricated', () => {
  assert.equal(pitchFormation(null), null);
  assert.equal(pitchFormation('unknown'), null);
  assert.equal(pitchFormation('4-4-4'), null);
});
test('diamond and repeated centre-back slots retain their intended structure', () => {
  assert.equal(pitchFormation('4-4-2 Diamond').shape, '4-1-2-1-2');
  const backs = pitchFormation('3-5-2').slots.filter(s => s.position === 'CB');
  assert.equal(backs.length, 3);
  assert.equal(backs[0].short, 'LCB');
  assert.equal(backs[2].short, 'RCB');
});
