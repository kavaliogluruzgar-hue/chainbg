
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

let waiting = null;

wss.on("connection", (ws) => {
  ws.enemy = null;

  if (waiting && waiting.readyState === WebSocket.OPEN) {
    ws.enemy = waiting;
    waiting.enemy = ws;

    ws.send(JSON.stringify({ type: "start", side: 2 }));
    waiting.send(JSON.stringify({ type: "start", side: 1 }));

    waiting = null;
  } else {
    waiting = ws;
    ws.send(JSON.stringify({ type: "waiting" }));
  }

  ws.on("message", (msg) => {
    if (ws.enemy && ws.enemy.readyState === WebSocket.OPEN) {
      ws.enemy.send(msg.toString());
    }
  });

  ws.on("close", () => {
    if (waiting === ws) waiting = null;

    if (ws.enemy) {
      ws.enemy.send(JSON.stringify({ type: "disconnect" }));
      ws.enemy.enemy = null;
    }
  });
});

console.log("ChainBG server started on", PORT);
