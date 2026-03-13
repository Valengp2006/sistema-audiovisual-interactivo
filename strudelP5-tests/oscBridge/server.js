// server.js  — Http Server BRIDGE
// Basado en el ejemplo de clase, con el canal visual agregado

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3005;

// Sirve archivos estáticos de la carpeta 'public'
app.use(express.static('public'));

// Sirve el controller.html en /controller
// (pon controller.html dentro de la carpeta 'public')
app.get('/controller', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'controller.html'));
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // ── Mensajes genéricos (del ejemplo original de clase) ──────────────
  socket.on('message', (message) => {
    console.log('Received message =>', message);
    socket.broadcast.emit('message', message);
  });

  // ── Canal visual: celular → p5.js ───────────────────────────────────
  // El celular emite: { parametro: 'tamanio', valor: 0-100 }
  // El servidor lo reenvía a TODOS los conectados (incluyendo p5.js)
  socket.on('visual-control', (data) => {
    console.log('Visual control recibido:', data);
    io.emit('visual-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server BRIDGE corriendo en http://localhost:${port}`);
  console.log(`Celular: abre http://10.8.95.188:${port}/controller`);
});