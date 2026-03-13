setcps(0.7);

let p1 = n("0 2 4 6 7 6 4 2")
  .scale("<c3:major>")
  .distort(0.9)
  .superimpose((x) => x.detune("<0.5>"))
  .lpenv(perlin.slow(3).range(1, 4))
  .lpf(perlin.slow(2).range(100, 2000))
  .gain(0.3);

let p2 = "<a1>/8".clip(0.8).struct("x*8").note();

let p3 = n("0@3 2 4 <[6,8] [7,9]>")
  .scale("C:minor")
  .sound("piano");

let p4 = sound("[bd*4,~ rim ~ cp]*<1 [2 4]>");

// CRÍTICO: El .osc() envía los eventos al bridge
$: stack(p1, p2, p3, p4, p1.osc(), p2.osc(), p3.osc(), p4.osc())
