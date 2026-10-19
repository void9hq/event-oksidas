<script>
  // One <svg> per format. svgEl is bound so the app can serialize it for export.
  import Defs from './lib/Defs.svelte';
  import A4 from './layouts/A4.svelte';
  import Wide from './layouts/Wide.svelte';
  import Square from './layouts/Square.svelte';

  const LAYOUTS = { a4: A4, wide: Wide, square: Square };

  let { format, theme: t, ev, seed, svgEl = $bindable() } = $props();

  const W = $derived(format.w);
  const H = $derived(format.h);
  const P = $derived(format.id); // id prefix, several SVGs share one document
  const Layout = $derived(LAYOUTS[format.layout]);
  const step = $derived(Math.max(W, H) / 70);
  const wordmarkFonts = $derived(ev.partners.map((p) => p.wordmark?.font).filter(Boolean));
</script>

<svg
  bind:this={svgEl}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 {W} {H}"
  width={format.physW ?? W}
  height={format.physH ?? H}
>
  <Defs {t} {P} {step} extraFonts={wordmarkFonts} />
  <rect width={W} height={H} fill={t.bg} />
  {#if t.grid > 0}
    <rect width={W} height={H} fill="url(#{P}-grid)" opacity={t.grid} />
  {/if}
  <Layout {W} {H} {ev} {t} {P} {seed} />
</svg>
