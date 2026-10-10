import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, addPlayer, act, view } from '../game.js';

function ready() {
  const g = createGame('ABC123');
  for (let i = 0; i < 5; i++) addPlayer(g, `Spelare ${i}`).socketId = `socket-${i}`;
  act(g, g.players[0], 'start', { round: g.round }); return g;
}
const action = (g, p, name, data = {}) => act(g, p, name, { round: g.round, ...data });
function propose(g, team = g.players.slice(0, g.results.length === 1 ? 3 : 2)) {
  action(g, g.players[g.leader], 'team', { team: team.map(p => p.id) }); return team;
}
test('five players, names, roles and private views', () => {
  const g = ready();
  assert.equal(g.players.filter(p => p.role === 'ond').length, 2);
  assert.throws(() => addPlayer(g, 'Extra'));
  for (const p of g.players) {
    const v = view(g, p);
    assert.equal(v.me.role, p.role);
    assert.ok(v.players.every(item => !('role' in item) && !('token' in item)));
    assert.equal(v.allies.length, p.role === 'ond' ? 2 : 0);
  }
});
test('only leader can propose exact team; votes cannot be repeated or stale', () => {
  const g = ready();
  assert.throws(() => action(g, g.players[(g.leader + 1) % 5], 'team', { team: [] }));
  assert.throws(() => action(g, g.players[g.leader], 'team', { team: [g.players[0].id] }));
  propose(g); const round = g.round;
  action(g, g.players[0], 'vote', { yes: true });
  assert.throws(() => action(g, g.players[0], 'vote', { yes: true }));
  assert.equal(view(g, g.players[1]).votes, null);
  g.players.slice(1).forEach(p => action(g, p, 'vote', { yes: true }));
  assert.equal(g.phase, 'mission');
  assert.throws(() => act(g, g.players[0], 'mission', { round, success: true }));
});
test('mission decisions private, only participants, good cannot sabotage', () => {
  const g = ready(); const good = g.players.find(p => p.role === 'god'), evil = g.players.find(p => p.role === 'ond');
  propose(g, [good, evil]); g.players.forEach(p => action(g, p, 'vote', { yes: true }));
  assert.throws(() => action(g, good, 'mission', { success: false }));
  assert.throws(() => action(g, g.players.find(p => p !== good && p !== evil), 'mission', { success: true }));
  action(g, evil, 'mission', { success: false });
  assert.ok(!JSON.stringify(view(g, good)).includes('missions'));
  assert.throws(() => action(g, evil, 'mission', { success: true }));
  action(g, good, 'mission', { success: true });
  assert.deepEqual(g.results, [{ success: false, failures: 1 }]);
});
test('three successful missions win and host can restart', () => {
  const g = ready();
  for (let i = 0; i < 3; i++) {
    const team = propose(g); g.players.forEach(p => action(g, p, 'vote', { yes: true }));
    team.forEach(p => action(g, p, 'mission', { success: true }));
  }
  assert.equal(g.winner, 'god'); assert.equal(g.phase, 'finished');
  action(g, g.players[0], 'start'); assert.equal(g.phase, 'team'); assert.equal(g.results.length, 0);
});
test('five consecutive rejected teams win for evil', () => {
  const g = ready();
  for (let i = 0; i < 5; i++) { propose(g); g.players.forEach(p => action(g, p, 'vote', { yes: false })); }
  assert.equal(g.winner, 'ond'); assert.equal(g.phase, 'finished');
});
