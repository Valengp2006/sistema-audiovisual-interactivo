let val = 0;
let x = 0, y = 0;
let socket;
let status = "Conectando...";

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = new WebSocket("ws://127.0.0.1:8081");

  socket.onopen = () => status = "¡CONECTADO!";
  socket.onerror = () => status = "Error en el socket";

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.address === "/fader_1") {
      val = Number(data.args?.[0] ?? 0);
      status = "fader_1";
    } else if (data.address === "/xy_1") {
      x = Number(data.args?.[0] ?? 0);
      y = Number(data.args?.[1] ?? 0);
      status = "xy_1";
    }
  };
}

function draw() {
  background(val * 255);

  fill(255);
  textSize(18);
  text(`${status}  fader=${val.toFixed(3)}  x=${x.toFixed(3)}  y=${y.toFixed(3)}`, 20, 30);

  // demo XY
  fill(0, 255, 0);
  circle(20 + x * (width - 40), 60 + y * (height - 100), 20);
}