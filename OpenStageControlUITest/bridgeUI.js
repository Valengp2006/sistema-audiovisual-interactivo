const { WebSocket } = require("ws");
const osc = require("osc");

const WS_PORT = 8083;
const OSC_PORT = 9000;

const wss = new WebSocket.Server({ 
  port: WS_PORT,
  host: '0.0.0.0'  // Permite conexiones desde la red
});
console.log("WS relay listening on ws://127.0.0.1:" + WS_PORT);

const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: OSC_PORT,
});

udpPort.open();

function normalizeArg(a) {
  // Soporta ambos formatos:
  // - raw: 0.3
  // - metadata: { type: "f", value: 0.3 }
  if (a != null && typeof a === "object" && "value" in a) return a.value;
  return a;
}

// Recibir OSC desde Open Stage Control
udpPort.on("message", (msg, timeTag, info) => {
  const payload = {
    address: msg.address,
    args: Array.isArray(msg.args) ? msg.args.map(normalizeArg) : [],
    from: { address: info.address, port: info.port },
    timeTag,
  };

  const text = JSON.stringify(payload);
  console.log("📥 OSC message:", text);

  // Broadcast a todos los clientes WebSocket conectados
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(text);
    }
  }
});

// NUEVO: Recibir WebSocket directo desde el público
wss.on('connection', (ws) => {
  console.log('✅ Cliente WebSocket conectado');

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      
      console.log("📱 Mensaje del público:", msg);

      // Reenviar a todos los clientes WebSocket (incluyendo visuales)
      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      }
    } catch (e) {
      console.error('Error procesando mensaje WebSocket:', e);
    }
  });

  ws.on('close', () => {
    console.log('❌ Cliente WebSocket desconectado');
  });
});

udpPort.on("ready", () => {
  console.log("OSC listening on udp://0.0.0.0:" + OSC_PORT);
});