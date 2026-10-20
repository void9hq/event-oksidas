// The oscilloscope band maths, shared by Wave.svelte (posters and site) and the site's tone
// engine, so what you hear is built from the same recipe as what you see.
//
// One waveform per seed: a fundamental plus one harmonic, then wavefolded. The first trace is the
// clean signal, each next one is folded harder, the last (front) one the hardest.
import { mulberry32 } from './util.js';

// Same draw order as always, so existing seeds keep their look.
export function waveParams(seed) {
  const rnd = mulberry32(seed);
  const f1 = 1 + rnd() * 2.2; // cycles across the band
  const m = 2 + Math.floor(rnd() * 3); // harmonic ratio: 2, 3 or 4
  const a2 = 0.2 + rnd() * 0.5; // harmonic level
  const ph = rnd() * Math.PI * 2;
  const ph2 = rnd() * Math.PI * 2;
  return { f1, m, f2: f1 * m, a2, ph, ph2 };
}

// How hard the front trace is folded: v = sin(raw * k * PI/2).
export const frontFold = (t, foldMul = 1) => 1 + t.wave.fold * foldMul * 5;

// live (optional, website only) — all fields default to "no change", so posters are untouched:
//   phase  radians the pattern has travelled
//   fold   multiplies the fold amount (knob)
//   freq   multiplies cycles across the band (knob / pitch)
//   amp    multiplies amplitude
//   hot    0..1, makes the front trace thicker (sound on)
export function tracePaths({ x, y, w, h, seed, t, N = 600, parallax = 0, live }) {
  const { f1: f1b, f2: f2b, a2, ph, ph2, m } = waveParams(seed);
  const n = t.wave.lines;
  const freq = live?.freq ?? 1;
  const foldMul = live?.fold ?? 1;
  const phase = live?.phase ?? 0;
  const hot = live?.hot ?? 0;
  const f1 = f1b * freq;
  const f2 = f2b * freq;
  const amp = h * 0.42 * (live?.amp ?? 1);
  const TAU = 2 * Math.PI;

  const out = [];
  for (let i = 0; i < n; i++) {
    const p = n > 1 ? i / (n - 1) : 1;
    const k = 1 + t.wave.fold * foldMul * 5 * Math.pow(p, 1.5); // fold amount
    const cy = y + h / 2 + (i - (n - 1) / 2) * h * 0.012;
    const a = ph + i * 0.12 + phase; // per-trace offset keeps the bundle fanned out
    const b = ph2 + phase * m; // the harmonic travels m times faster, so the shape holds together
    let d = '';
    for (let j = 0; j <= N; j++) {
      const u = j / N;
      const env = 0.3 + 0.7 * Math.pow(Math.sin(Math.PI * u), 1.2);
      const raw = (Math.sin(TAU * f1 * u + a) + a2 * Math.sin(TAU * f2 * u + b)) / (1 + a2);
      const v = Math.sin((raw * k * Math.PI) / 2);
      d += `${j ? 'L' : 'M'}${(x + u * w).toFixed(1)} ${(cy - v * env * amp).toFixed(1)}`;
    }
    const last = i === n - 1;
    const depth = (p - 0.3) * parallax;
    out.push({
      d,
      style: parallax
        ? `transform:translate(calc(var(--px,0)*${depth.toFixed(1)}px),calc(var(--py,0)*${(depth * 0.35).toFixed(1)}px))`
        : undefined,
      color: last ? t.accent2 : t.accent,
      width: h * (last ? 0.008 * (1 + 0.8 * hot) : 0.0035),
      opacity: last ? 1 : t.wave.opacity * (0.2 + 0.8 * p),
    });
  }
  return out;
}
