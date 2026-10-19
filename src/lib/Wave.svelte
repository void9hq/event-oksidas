<script>
  // Oscilloscope band: a bundle of traces sharing one waveform. The first trace is a clean
  // sine-ish signal, each next one is wavefolded harder — the signal "oxidizes".
  import { mulberry32 } from './util.js';

  // parallax: max shift in user units. Each trace moves by CSS vars --px/--py (-1..1, set by the
  // page) scaled by its depth: back traces drift slightly against, the front ones with the pointer.
  // 0 (posters) emits no style at all, so exported SVGs stay static.
  let { x, y, w, h, seed, t, ticks = true, parallax = 0 } = $props();

  const N = 600;

  const traces = $derived.by(() => {
    const rnd = mulberry32(seed);
    const n = t.wave.lines;
    const f1 = 1 + rnd() * 2.2; // cycles across the band
    const f2 = f1 * (2 + Math.floor(rnd() * 3));
    const a2 = 0.2 + rnd() * 0.5;
    const ph = rnd() * Math.PI * 2;
    const ph2 = rnd() * Math.PI * 2;
    const amp = h * 0.42;

    const out = [];
    for (let i = 0; i < n; i++) {
      const p = n > 1 ? i / (n - 1) : 1;
      const k = 1 + t.wave.fold * 5 * Math.pow(p, 1.5); // fold amount
      const cy = y + h / 2 + (i - (n - 1) / 2) * h * 0.012;
      const drift = i * 0.12;
      let d = '';
      for (let j = 0; j <= N; j++) {
        const u = j / N;
        const env = 0.3 + 0.7 * Math.pow(Math.sin(Math.PI * u), 1.2);
        const raw =
          (Math.sin(2 * Math.PI * f1 * u + ph + drift) + a2 * Math.sin(2 * Math.PI * f2 * u + ph2)) / (1 + a2);
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
        width: h * (last ? 0.008 : 0.0035),
        opacity: last ? 1 : t.wave.opacity * (0.2 + 0.8 * p),
      });
    }
    return out;
  });

  const tickXs = $derived(Array.from({ length: 41 }, (_, i) => x + (i * w) / 40));
</script>

<g fill="none" stroke-linejoin="round" stroke-linecap="round">
  {#if ticks}
    {#each tickXs as tx, i}
      {@const len = h * (i % 5 === 0 ? 0.05 : 0.025)}
      <line x1={tx} x2={tx} y1={y} y2={y + len} stroke={t.line} stroke-width={h * 0.003} />
      <line x1={tx} x2={tx} y1={y + h} y2={y + h - len} stroke={t.line} stroke-width={h * 0.003} />
    {/each}
  {/if}
  {#each traces as tr}
    <path d={tr.d} stroke={tr.color} stroke-width={tr.width} opacity={tr.opacity} style={tr.style} />
  {/each}
</g>
