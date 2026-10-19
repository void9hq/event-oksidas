<script>
  import { stack, measure, fontsReady } from '../fonts.js';

  // Partner slot, one of three kinds:
  //   href      — logo image fitted inside a light plate (brand colours stay legible on any theme)
  //   wordmark  — partner name set in its own font on the same plate ({ font, weight, spacing })
  //   neither   — dashed placeholder
  // caption: optional small line at the top of the plate. cs = caption size.
  let { x, y, w, h, t, href = null, wordmark = null, text, fs, rx = 0, caption = '', cs = fs } = $props();

  let ready = $state(false);
  fontsReady.then(() => (ready = true));

  const plated = $derived(!!(href || wordmark));
  const tw = $derived(text.length * fs * 0.85 + fs * 1.2); // rough backing width for the label
  const pad = $derived(Math.min(w, h) * (caption ? 0.12 : 0.16));
  const capH = $derived(caption ? cs * 1.4 : 0);
  // inner box for the logo / wordmark
  const box = $derived({ x: x + pad, y: y + pad + capH, w: w - 2 * pad, h: h - 2 * pad - capH });
  // text on the light plate needs dark ink regardless of theme
  const ink = $derived(t.plateFg ?? '#1b1714');
  const capFill = $derived(t.plateMuted ?? '#5f574f');

  // wordmark: largest size that fits the inner box (width-bound for long names, height-bound for short)
  const wm = $derived.by(() => {
    if (!wordmark) return null;
    ready; // re-measure once embedded fonts are in
    const weight = wordmark.weight ?? 400;
    const sp = wordmark.spacing ?? 0;
    const em = measure(text, wordmark.font, weight, sp);
    // height cap keeps short, heavy names (3022) from out-weighing the image logos
    const size = Math.min(box.w / em, box.h * 0.48);
    return { size, weight, sp: sp * size, family: stack(wordmark.font) };
  });
</script>

{#if plated}
  <rect {x} {y} width={w} height={h} rx={rx || fs * 0.25} fill={t.plate} />
  {#if caption}
    <text
      x={x + w / 2}
      y={y + pad + cs * 0.85}
      text-anchor="middle"
      font-family={stack(t.fonts.body)}
      font-weight="400"
      font-size={cs}
      fill={capFill}>{caption}</text
    >
  {/if}
  {#if href}
    <image {href} x={box.x} y={box.y} width={box.w} height={box.h} preserveAspectRatio="xMidYMid meet" />
  {:else}
    <!-- trailing letter-spacing is added after the last glyph too, shift by half to stay centred -->
    <text
      x={box.x + box.w / 2 + wm.sp / 2}
      y={box.y + box.h / 2 + wm.size * 0.36}
      text-anchor="middle"
      font-family={wm.family}
      font-weight={wm.weight}
      font-size={wm.size}
      letter-spacing={wm.sp}
      fill={ink}>{text}</text
    >
  {/if}
{:else}
  <rect {x} {y} width={w} height={h} {rx} fill={t.panel} />
  <g stroke={t.line} stroke-width={fs * 0.06} opacity="0.7">
    <line x1={x} y1={y} x2={x + w} y2={y + h} />
    <line x1={x + w} y1={y} x2={x} y2={y + h} />
  </g>
  <rect
    {x}
    {y}
    width={w}
    height={h}
    {rx}
    fill="none"
    stroke={t.line}
    stroke-width={fs * 0.08}
    stroke-dasharray="{fs * 0.4} {fs * 0.3}"
  />
  <rect x={x + w / 2 - tw / 2} y={y + h / 2 - fs * 0.9} width={tw} height={fs * 1.8} fill={t.panel} />
  <text
    x={x + w / 2}
    y={y + h / 2 + fs * 0.36}
    text-anchor="middle"
    font-family={stack(t.fonts.body)}
    font-weight="600"
    font-size={fs}
    letter-spacing={fs * 0.2}
    fill={t.muted}>{text}</text
  >
{/if}
