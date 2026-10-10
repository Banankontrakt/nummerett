import express from 'express';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { createGame, addPlayer, act, view } from './game.js';

export function createApp() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, { maxHttpBufferSize: 8192 });
  const games = new Map();
  const root = fileURLToPath(new URL('.', import.meta.url));
  app.get('/health', (_req, res) => res.json({ ok: true }));
  // Only browser assets are public; server code and configuration are excluded.
  for (const asset of ['index.html', 'spelet.html', 'spelet.css', 'spelet.js']) app.get(`/${asset}`, (_req, res) => res.sendFile(root + asset));
  app.get('/', (_req, res) => res.sendFile(root + 'index.html'));
  for (const folder of ['bilderavalon', 'styles-css', 'scripts-js']) app.use(`/${folder}`, express.static(root + folder));
  const broadcast = game => {
    game.touched = Date.now();
    for (const p of game.players) if (p.socketId) io.to(p.socketId).emit('state', view(game, p));
  };
  io.on('connection', socket => {
    let membership = null;
    let budget = 40, windowStart = Date.now();
    const handle = (event, fn) => socket.on(event, (data, reply) => {
      if (typeof reply !== 'function') return;
      try {
        if (Date.now() - windowStart > 10000) { budget = 40; windowStart = Date.now(); }
        if (--budget < 0) throw new Error('För många försök. Vänta en stund.');
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Ogiltig begäran.');
        reply({ ok: true, ...fn(data) });
      } catch (error) { reply({ ok: false, error: error.message }); }
    });
    handle('enter', data => {
      if (membership) throw new Error('Du är redan i en lobby.');
      let game, player;
      if (data.token) {
        game = games.get(String(data.code).toUpperCase());
        player = game?.players.find(p => p.token === data.token);
        if (!player) throw new Error('Lobbyn finns inte kvar. Skapa eller gå med i en ny lobby.');
      } else {
        if (data.create) {
          if (games.size >= 200) throw new Error('Servern är full. Försök senare.');
          let code; do { code = randomBytes(3).toString('hex').toUpperCase(); } while (games.has(code));
          game = createGame(code);
        } else game = games.get(String(data.code).trim().toUpperCase());
        if (!game) throw new Error('Ingen lobby hittades med den koden.');
        player = addPlayer(game, data.name);
        games.set(game.code, game);
      }
      const oldSocket = player.socketId && io.sockets.sockets.get(player.socketId);
      player.socketId = socket.id;
      membership = { game, player };
      oldSocket?.disconnect(true);
      broadcast(game);
      return { code: game.code, token: player.token };
    });
    handle('action', data => {
      if (!membership) throw new Error('Anslut till en lobby först.');
      act(membership.game, membership.player, data.action, data);
      broadcast(membership.game); return {};
    });
    handle('leave', () => {
      if (!membership) return {};
      const { game, player } = membership;
      if (game.phase !== 'lobby' && game.phase !== 'finished') throw new Error('Du kan återansluta till det pågående spelet.');
      game.players = game.players.filter(p => p !== player);
      if (game.hostId === player.id) game.hostId = game.players[0]?.id ?? null;
      membership = null; broadcast(game);
      if (!game.players.length) games.delete(game.code);
      return {};
    });
    socket.on('disconnect', () => {
      if (membership && membership.player.socketId === socket.id) {
        membership.player.socketId = null; broadcast(membership.game);
      }
    });
  });
  const cleanup = setInterval(() => {
    for (const [code, game] of games) if (!game.players.some(p => p.socketId) && Date.now() - game.touched > 3600000) games.delete(code);
  }, 60000);
  cleanup.unref();
  server.on('close', () => clearInterval(cleanup));
  return { server, io };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { server } = createApp();
  server.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Avanon-servern är redo.'));
}
