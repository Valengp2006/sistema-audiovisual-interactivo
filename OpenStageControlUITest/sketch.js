let val = 0;
let socket;
let appStatus = "Conectando...";

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Conectamos
  socket = new WebSocket("ws://127.0.0.1:8081");

  socket.onopen = () => {
    appStatus = "¡CONECTADO Y ACTIVADO!";
    console.log("Conexión abierta. Enviando saludo inicial...");
    // socket.send(JSON.stringify({ type: 'init' }));
  };

  socket.onmessage = (event) => {
    console.log("Mensaje recibido:", event.data);
    const data = JSON.parse(event.data);
    if (data.address !== "/fader_1") return;
    const n = Number(data.args?.[0]);
    val = Number.isFinite(n) ? constrain(n, 0, 1) : 0;
    appStatus = "Recibiendo de: " + data.address;
  };

  socket.onerror = (err) => {
    appStatus = "Error en el socket";
    console.error(err);
  };
}

function draw() {
  background(val * 255);

  fill(255, 0, 0);
  noStroke();
  textSize(20);
  text(appStatus, 20, 40);

  fill(0, 255, 0);
  rect(20, 100, val * (width - 40), 50);

  fill(255);
  text("Valor: " + nf(val, 1, 3), 20, 85);
}
