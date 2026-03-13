# strudelP5-tests

La idea de este repositorio es documentar un experimento de integración y sincronización entre strudel y p5.js.

## Instalación local de strudel

1. Lo primero es clonar el respositorio oficial de strudel en local: https://codeberg.org/uzu/strudel/src/branch/main
2. Es necesario instalar pnpm:

``` bash
npm install -g pnpm@latest-10
```

3. Luego instalar las dependecias:

``` bash
pnpm i
```

4. Correr un servidor local para servir el RPEL de strudel:

``` bash
pnpm dev
```

5. Descargar de este repositorio el OSCBridge, instalar las dependencias y ejecutarlo:

``` bash
npm install
node bridge.js
```
7. En el repositorio de Strudel guardar, en la carpeta website/public, la aplicación p5.js. En este caso será Visuales visualesHouse.html, pero se puede cambiar para experimentar con otras visuales.
8. Servir las visuales visualesHouse.html abriendo una pestaña en el navegador con estas url http://localhost:4321/visualesHouse.html
9. Pegar en el REPEL de Strudel:

``` js
setcps(0.5)

const pat = s("[bd*2 sd hh oh]").bank("tr909")

$: stack(
  pat.gain('0.05'),
  pat.osc()
)
```

Y también es posible ensayar con este tema:

``` js
setcps(0.5)

// const pat = s("[bd*2 sd hh oh]").bank("tr909")

// $: stack(
//   pat.gain('0.05'),
//   pat.osc()
// )

let bassLine = note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>").sound("gm_synth_bass_1")
  .lpf(slider(1000, 0, 1000))

let leadLine = n(`<
[~ 0] 2 [0 2] [~ 2]
[~ 0] 1 [0 1] [~ 1]
[~ 0] 3 [0 3] [~ 3]
[~ 0] 2 [0 2] [~ 2]
>*4`).scale("C4:minor")
.sound("gm_synth_strings_1")

let drumLine = sound("bd*4, [~ <sd cp>]*2, [~ hh]*4")
.bank("tr909")

let hhLine = sound("hh*16").gain(sine)

$: stack(
  bassLine,
  bassLine.osc() // 'gm_synth_bass_1'
)

$: stack(
  leadLine,
  leadLine.osc()
)

$: stack(
  drumLine,
  drumLine.osc()
)

_$: stack(
  hhLine,
  hhLine.osc()
)
```

9. Si se requiere personalizar el mensaje que envía el REPL de strudel al puente, se debe abrir el archivo packages/osc/osc.mjs que está en los fuentes de strudel descargados de github. La función a personalizar sería esta:

``` js
export async function oscTrigger(hap, currentTime, cps = 1, targetTime) {

  //console.log('[osc] sending OSC message', hap);
  console.log('currentTime', currentTime);
  console.log('targetTime', targetTime);

  const ws = await connect();
  const controls = parseControlsFromHap(hap, cps);
  const keyvals = Object.entries(controls).flat();
  const ts = collator.calculateTimestamp(currentTime, targetTime) * 1000;

  //controls.st_ts = ts; // 'st_ts' por Strudel Timestamp
  //const keyvals = Object.entries(controls).flat();

  const msg = { address: '/dirt/play', args: keyvals, timestamp: ts };
  //const msg = { address: '/dirt/play', args: keyvals, timestamp: ts };

  console.log('ts', ts);

  if ('oschost' in hap.value) {
    msg['host'] = hap.value['oschost'];
  }
  if ('oscport' in hap.value) {
    msg['port'] = hap.value['oscport'];
  }
  ws.send(JSON.stringify(msg));
}
```

