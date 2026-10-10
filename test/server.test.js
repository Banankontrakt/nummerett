import test from 'node:test';
import assert from 'node:assert/strict';
import { io as connect } from 'socket.io-client';
import { createApp } from '../server.js';

test('five real clients share a lobby, reconnect and keep roles private', async t => {
  const { server, io } = createApp();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const clients = [];
  t.after(async () => { clients.forEach(c => c.disconnect()); await new Promise(resolve => io.close(resolve)); });
  async function client() {
    const s = connect(url, { transports: ['websocket'], forceNew: true });
    clients.push(s); s.on('state', state => { s.state = state; });
    await new Promise((resolve, reject) => { s.once('connect', resolve); s.once('connect_error', reject); }); return s;
  }
  const send = (s, event, data) => new Promise((resolve, reject) => s.timeout(2000).emit(event, data, (err, result) => err ? reject(err) : resolve(result)));
  const host = await client(); const session = await send(host, 'enter', { create: true, name: 'Värd' });
  assert.ok(session.ok);
  for (let i = 1; i < 5; i++) { const s = await client(); assert.ok((await send(s, 'enter', { code: session.code, name: `Spelare ${i}` })).ok); }
  const outsider = await client(); assert.equal((await send(outsider, 'enter', { code: session.code, name: 'Extra' })).ok, false);
  assert.equal((await send(outsider, 'enter', { code: session.code, token: 'wrong' })).ok, false);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(host.state.players.length, 5);
  assert.ok((await send(host, 'action', { action: 'start', round: host.state.round })).ok);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.ok(host.state.players.every(p => !('role' in p)));
  const original = host.state.me;
  host.disconnect(); const resumed = await client();
  assert.ok((await send(resumed, 'enter', { code: session.code, token: session.token })).ok);
  assert.equal(resumed.state.me.id, original.id); assert.equal(resumed.state.me.role, original.role);
  const isolated = await client(); await send(isolated, 'enter', { create: true, name: 'Annan lobby' });
  assert.notEqual(isolated.state.code, session.code); assert.equal(isolated.state.players.length, 1);
  assert.equal((await fetch(url + '/server.js')).status, 404);
  assert.equal((await fetch(url + '/game.js')).status, 404);
  assert.equal((await fetch(url + '/spelet.html')).status, 200);
  assert.equal((await fetch(url + '/socket.io/socket.io.js')).status, 200);
  assert.equal((await fetch(url + '/health')).status, 200);
});
