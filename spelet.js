const $ = id => document.getElementById(id);
const socket = io();
let state = null, selected = new Set(), lastRound = null, session = null;
try { session = JSON.parse(sessionStorage.getItem('avanon-session')); } catch {}
const showError = message => { $('error').textContent = message || ''; };
function send(event, data, done = () => {}) {
  if (!socket.connected) return showError('Vänta tills servern är ansluten.');
  socket.timeout(10000).emit(event, data, (timeout, response) => {
    if (timeout) return showError('Svaret dröjer. Anslutningen kan ha avbrutits.');
    if (!response.ok) {
      if (event === 'enter' && data.token) { session = null; state = null; sessionStorage.removeItem('avanon-session'); render(); }
      return showError(response.error);
    }
    showError(''); done(response);
  });
}
function saveSession(response) { session = { code: response.code, token: response.token }; sessionStorage.setItem('avanon-session', JSON.stringify(session)); }
socket.on('connect', () => { $('connection').textContent = 'Ansluten till spelservern.'; if (session) send('enter', session, saveSession); render(); });
socket.on('disconnect', () => { $('connection').textContent = 'Anslutningen avbröts. Försöker återansluta…'; render(); });
socket.on('connect_error', () => { $('connection').textContent = 'Väntar på servern… Render Free kan ta ungefär en minut att starta.'; });
socket.on('state', next => { state = next; render(); });
$('entry-form').addEventListener('submit', event => {
  event.preventDefault(); const create = event.submitter?.id !== 'join';
  if (!create && !/^[A-Fa-f0-9]{6}$/.test($('code').value.trim())) return showError('Ange lobbykoden med sex tecken.');
  send('enter', { create, name: $('name').value.trim(), code: $('code').value.trim() }, saveSession);
});
const action = (name, data = {}) => send('action', { action: name, round: state.round, ...data });
$('start').onclick = () => action('start');
$('confirm-team').onclick = () => action('team', { team: [...selected] });
$('yes').onclick = () => action('vote', { yes: true }); $('no').onclick = () => action('vote', { yes: false });
$('success').onclick = () => action('mission', { success: true }); $('fail').onclick = () => action('mission', { success: false });
$('show-role').onclick = () => { $('my-role').hidden = !$('my-role').hidden; $('show-role').textContent = $('my-role').hidden ? 'Visa min roll' : 'Dölj min roll'; };
$('copy').onclick = async () => { try { await navigator.clipboard.writeText(state.code); $('copy').textContent = 'Kopierad!'; } catch { showError('Kopiera koden som visas ovan.'); } };
$('leave').onclick = () => send('leave', {}, () => { session = null; state = null; sessionStorage.removeItem('avanon-session'); render(); });
function render() {
  $('entry').hidden = Boolean(state); $('room').hidden = !state;
  for (const button of document.querySelectorAll('button')) button.disabled = !socket.connected;
  if (!state) return;
  if (lastRound !== state.round) {
    selected = new Set(state.team); lastRound = state.round;
    if (state.phase === 'team' && state.results.length === 0) { $('my-role').hidden = true; $('show-role').textContent = 'Visa min roll'; }
  }
  $('lobby-code').textContent = state.code; $('message').textContent = state.message;
  $('start').hidden = state.me.id !== state.hostId || !['lobby', 'finished'].includes(state.phase);
  $('start').textContent = state.phase === 'finished' ? 'Spela igen' : 'Starta spelet';
  $('start').disabled = !socket.connected || state.players.length !== 5 || state.players.some(p => !p.connected);
  $('leave').hidden = !['lobby', 'finished'].includes(state.phase); $('role-panel').hidden = !state.me.role;
  const allies = state.players.filter(p => state.allies.includes(p.id) && p.id !== state.me.id).map(p => p.name);
  $('my-role').textContent = state.me.role === 'ond' ? `Du är ond. Din medspelare är ${allies.join(', ')}.` : 'Du är god. Hjälp till att slutföra tre uppdrag.';
  $('rejections').textContent = `Avvisade lag i följd: ${state.rejected}/5`;
  $('quest-bar').replaceChildren();
  [2, 3, 2, 3, 3].forEach((size, i) => {
    const circle = document.createElement('div'); circle.className = 'quest-circle';
    if (state.results[i]) circle.classList.add(state.results[i].success ? 'success' : 'fail');
    else if (i === state.results.length && !['lobby', 'finished'].includes(state.phase)) circle.classList.add('active');
    circle.textContent = `Uppdrag ${i + 1} · ${size}`;
    circle.title = state.results[i] ? `${state.results[i].success ? 'Lyckat' : 'Misslyckat'}: ${state.results[i].failures} sabotage` : `${size} spelare`;
    $('quest-bar').append(circle);
  });
  const choosing = state.phase === 'team' && state.leaderId === state.me.id;
  $('player-grid').replaceChildren();
  state.players.forEach(player => {
    const card = document.createElement('div'); card.className = 'player-container';
    const name = document.createElement('h3'); name.textContent = player.name + (player.id === state.me.id ? ' (du)' : '');
    const status = document.createElement('p');
    status.textContent = [player.connected ? 'Ansluten' : 'Frånkopplad', player.id === state.hostId ? 'Värd' : '', player.id === state.leaderId && state.phase !== 'lobby' ? 'Ledare' : '', state.team.includes(player.id) ? 'På uppdraget' : '', player.role ? (player.role === 'ond' ? 'Ond' : 'God') : '', state.votes ? (state.votes[player.id] ? 'Röstade ja' : 'Röstade nej') : ''].filter(Boolean).join(' · ');
    card.append(name, status);
    if (choosing) {
      const label = document.createElement('label'), input = document.createElement('input');
      input.type = 'checkbox'; input.className = 'follow-checkbox'; input.checked = selected.has(player.id); input.disabled = !socket.connected;
      input.onchange = () => { input.checked ? selected.add(player.id) : selected.delete(player.id); updateTeamButton(); };
      label.append(input, document.createTextNode(' Följa med')); card.append(label);
    }
    $('player-grid').append(card);
  });
  $('confirm-team').hidden = !choosing; updateTeamButton();
  $('voting').hidden = state.phase !== 'vote' || state.me.voted;
  $('mission').hidden = state.phase !== 'mission' || !state.team.includes(state.me.id) || state.me.submitted; $('fail').hidden = state.me.role !== 'ond';
  const leader = state.players.find(p => p.id === state.leaderId)?.name ?? '';
  $('instruction').textContent = state.phase === 'lobby' ? `${state.players.length}/5 spelare. Dela lobbykoden med dina vänner.`
    : state.phase === 'team' ? `${leader} väljer ${state.required} spelare till uppdraget.`
    : state.phase === 'vote' ? `${state.voteCount}/5 har röstat.${state.me.voted ? ' Din röst är registrerad.' : ''}`
    : state.phase === 'mission' ? `${state.missionCount}/${state.team.length} uppdragsbeslut är inlämnade.${state.me.submitted ? ' Ditt beslut är registrerat.' : ''}`
    : 'Spelet är slut. Värden kan starta en ny omgång.';
}
function updateTeamButton() { $('confirm-team').disabled = !socket.connected || selected.size !== state.required; }
