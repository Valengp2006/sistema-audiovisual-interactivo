const WebSocket = require('ws');
const osc = require('node-osc');

// 1. CONFIGURACIÓN
const STRUDEL_PORT = 8080;   // Donde Strudel envía los datos
const P5JS_PORT = 8081;      // Donde p5.js escuchará
//const SC_PORT = 57120;       // Puerto de SuperCollider (SuperDirt)
const SC_HOST = '127.0.0.1';

// 2. CLIENTE OSC (Para enviar sonido a SuperCollider)
//const oscClient = new osc.Client(SC_HOST, SC_PORT);

// 3. SERVIDOR WEBSOCKET PARA STRUDEL (Puerto 8080)
const wssStrudel = new WebSocket.Server({ port: STRUDEL_PORT });

// 4. SERVIDOR WEBSOCKET PARA P5.JS (Puerto 8081)
const wssP5 = new WebSocket.Server({ port: P5JS_PORT });

console.log(`🚀 Super Bridge Iniciado`);
console.log(`- Escuchando a Strudel en ws://localhost:${STRUDEL_PORT}`);
console.log(`- Transmitiendo a p5.js en ws://localhost:${P5JS_PORT}`);
//console.log(`- Enviando audio a SuperCollider en ${SC_HOST}:${SC_PORT}`);

wssStrudel.on('connection', (ws) => {
    console.log('✅ Strudel conectado al Bridge');

    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            // msg suele ser: { address: '/dirt/play', args: [...], timestamp: 12345 }

            // A. ENVIAR A SUPERCOLLIDER (OSC)
            // node-osc espera: .send(address, val1, val2, ...)
            // oscClient.send(msg.address, ...msg.args, (err) => {
            //     if (err) console.error('Error enviando OSC:', err);
            // });

            // B. REENVIAR A P5.JS (WebSocket)
            // Enviamos el JSON tal cual, ya trae el st_ts si lo inyectaste en osc.mjs
            const payload = JSON.stringify(msg);
            console.log('📤 Reenviando a p5.js:', payload);
            
            wssP5.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(payload);
                }
            });

        } catch (e) {
            console.error('Error procesando mensaje de Strudel:', e);
        }
    });
});

wssP5.on('connection', (ws) => {
    console.log('🎨 p5.js se ha conectado al Bridge');
});
