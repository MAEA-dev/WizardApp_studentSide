// Tiny relay: pairs two phones by room code and forwards their moves.
const { WebSocketServer } = require("ws");
const port = Number(process.env.PORT) || 5000;
const wss = new WebSocketServer({ port, host: "0.0.0.0" });
const rooms = new Map();
const send = (ws, o) => ws.readyState === 1 && ws.send(JSON.stringify(o));

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let m;
    try {
      m = JSON.parse(raw);
    } catch {
      return;
    }
    if (m.type === "join") {
      const code = String(m.room || "")
        .toUpperCase()
        .slice(0, 12);
      const r = rooms.get(code) || [];
      if (r.length >= 2) return send(ws, { type: "full" });
      r.push(ws);
      rooms.set(code, r);
      ws.room = code;
      if (r.length === 1) send(ws, { type: "wait" });
      else {
        send(r[0], { type: "start", first: true });
        send(r[1], { type: "start", first: false });
      }
    } else {
      (rooms.get(ws.room) || []).forEach((c) => c !== ws && send(c, m));
    }
  });
  ws.on("close", () => {
    const r = (rooms.get(ws.room) || []).filter((c) => c !== ws);
    r.forEach((c) => send(c, { type: "left" }));
    r.length ? rooms.set(ws.room, r) : rooms.delete(ws.room);
  });
});
console.log(`Wizard Duel relay listening on :${port}`);
