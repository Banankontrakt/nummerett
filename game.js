import { randomInt, randomUUID } from 'node:crypto';

export const teamSizes = [2, 3, 2, 3, 3];
const requireRule = (condition, message) => { if (!condition) throw new Error(message); };
export function createGame(code) {
  return { code, players: [], hostId: null, phase: 'lobby', leader: 0, team: [], votes: {}, missions: {}, results: [], rejected: 0, winner: null, round: 0, message: 'Väntar på fem spelare.' };
}
export function addPlayer(game, name) {
  requireRule(game.phase === 'lobby', 'Spelet har redan startat.');
  requireRule(game.players.length < 5, 'Lobbyn är full.');
  requireRule(typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 24, 'Ange ett namn med 1–24 tecken.');
  name = name.trim();
  requireRule(!game.players.some(p => p.name.toLocaleLowerCase('sv') === name.toLocaleLowerCase('sv')), 'Namnet används redan i lobbyn.');
  const player = { id: randomUUID(), token: randomUUID(), name, role: null, socketId: null };
  game.players.push(player);
  game.hostId ??= player.id;
  return player;
}
export function act(game, player, action, data = {}) {
  requireRule(game.players.includes(player), 'Du tillhör inte lobbyn.');
  requireRule(data.round === game.round, 'Spelet har gått vidare. Försök igen.');
  if (action === 'start') {
    requireRule(player.id === game.hostId, 'Endast värden kan starta spelet.');
    requireRule(game.phase === 'lobby' || game.phase === 'finished', 'Spelet pågår redan.');
    requireRule(game.players.length === 5 && game.players.every(p => p.socketId), 'Alla fem spelare måste vara anslutna.');
    const roles = ['ond', 'ond', 'god', 'god', 'god'];
    for (let i = roles.length - 1; i > 0; i--) { const j = randomInt(i + 1); [roles[i], roles[j]] = [roles[j], roles[i]]; }
    game.players.forEach((p, i) => { p.role = roles[i]; });
    Object.assign(game, { phase: 'team', leader: randomInt(5), team: [], votes: {}, missions: {}, results: [], rejected: 0, winner: null, message: 'Ledaren väljer ett uppdragslag.' });
    game.round++;
  } else if (action === 'team') {
    requireRule(game.phase === 'team' && game.players[game.leader].id === player.id, 'Endast ledaren kan välja lag nu.');
    requireRule(Array.isArray(data.team) && data.team.length === teamSizes[game.results.length] && new Set(data.team).size === data.team.length && data.team.every(id => game.players.some(p => p.id === id)), 'Välj rätt antal spelare.');
    game.team = [...data.team]; game.votes = {}; game.phase = 'vote'; game.round++;
    game.message = 'Alla röstar om uppdragslaget.';
  } else if (action === 'vote') {
    requireRule(game.phase === 'vote' && typeof data.yes === 'boolean', 'Du kan inte rösta nu.');
    requireRule(!Object.hasOwn(game.votes, player.id), 'Du har redan röstat.');
    game.votes[player.id] = data.yes;
    if (Object.keys(game.votes).length === 5) {
      if (Object.values(game.votes).filter(Boolean).length >= 3) {
        game.phase = 'mission'; game.missions = {}; game.rejected = 0;
        game.message = 'Laget är godkänt. De utvalda lämnar sina hemliga uppdragsbeslut.';
      } else {
        game.rejected++; game.leader = (game.leader + 1) % 5; game.team = [];
        game.phase = game.rejected >= 5 ? 'finished' : 'team';
        if (game.phase === 'finished') game.winner = 'ond';
        game.message = game.winner ? 'Fem lag har avvisats. De onda vinner!' : 'Laget avvisades. Nästa ledare väljer lag.';
      }
      game.round++;
    }
  } else if (action === 'mission') {
    requireRule(game.phase === 'mission' && game.team.includes(player.id) && typeof data.success === 'boolean', 'Du deltar inte i ett uppdrag nu.');
    requireRule(!Object.hasOwn(game.missions, player.id), 'Du har redan lämnat ditt beslut.');
    requireRule(player.role === 'ond' || data.success, 'Goda spelare måste lyckas med uppdraget.');
    game.missions[player.id] = data.success;
    if (Object.keys(game.missions).length === game.team.length) {
      const failures = Object.values(game.missions).filter(v => !v).length;
      game.results.push({ success: failures === 0, failures });
      const good = game.results.filter(r => r.success).length;
      const evil = game.results.length - good;
      game.winner = good >= 3 ? 'god' : evil >= 3 ? 'ond' : null;
      game.phase = game.winner ? 'finished' : 'team';
      game.message = game.winner ? `De ${game.winner === 'god' ? 'goda' : 'onda'} har vunnit!` : `Uppdraget ${failures ? 'misslyckades' : 'lyckades'}. Nästa ledare väljer lag.`;
      game.leader = (game.leader + 1) % 5; game.team = []; game.missions = {}; game.votes = {}; game.round++;
    }
  } else throw new Error('Okänd handling.');
}
export function view(game, player) {
  return {
    code: game.code, hostId: game.hostId, phase: game.phase, leaderId: game.players[game.leader]?.id,
    team: game.team, required: teamSizes[game.results.length] ?? 0, results: game.results,
    rejected: game.rejected, winner: game.winner, round: game.round, message: game.message,
    voteCount: Object.keys(game.votes).length, missionCount: Object.keys(game.missions).length,
    me: { id: player.id, role: player.role, voted: Object.hasOwn(game.votes, player.id), submitted: Object.hasOwn(game.missions, player.id) },
    allies: player.role === 'ond' ? game.players.filter(p => p.role === 'ond').map(p => p.id) : [],
    votes: game.phase === 'mission' ? game.votes : null,
    players: game.players.map(p => ({ id: p.id, name: p.name, connected: Boolean(p.socketId), ...(game.phase === 'finished' ? { role: p.role } : {}) }))
  };
}
