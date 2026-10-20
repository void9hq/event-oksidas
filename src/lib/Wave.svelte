<script>
  // Oscilloscope band: a bundle of traces sharing one waveform. The first trace is a clean
  // sine-ish signal, each next one is wavefolded harder — the signal "oxidizes".
  // The maths lives in wavemath.js.
  import { tracePaths } from './wavemath.js';

  // parallax: max shift in user units. Each trace moves by CSS vars --px/--py (-1..1, set by the
  // page) scaled by its depth: back traces drift slightly against, the front ones with the pointer.
  // 0 (posters) emits no style at all, so exported SVGs stay static.
  // N: points per trace; raise it for bands much wider than the view (carousel panorama).
  // live: website only, animated state { phase, fold, freq, amp, hot }; see wavemath.js.
  let { x, y, w, h, seed, t, ticks = true, parallax = 0, N = 600, live = undefined } = $props();

  const traces = $derived(tracePaths({ x, y, w, h, seed, t, N, parallax, live }));

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
