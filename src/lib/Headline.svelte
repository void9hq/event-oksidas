<script>
  import { stack } from '../fonts.js';

  // y is the baseline. Text is forced to exactly w via textLength (spacing only, glyphs untouched).
  // size defaults to what fits a 0.6em-advance monospace into w.
  let { x, y, w, text, t, size = w / (text.length * 0.6) } = $props();

  const off = $derived(size * 0.035);
  const family = $derived(stack(t.fonts.head));
</script>

{#if t.shadow > 0}
  <text
    x={x + off}
    y={y + off}
    font-family={family}
    font-weight="700"
    font-size={size}
    textLength={w}
    lengthAdjust="spacing"
    fill={t.accent2}
    opacity={t.shadow}>{text}</text
  >
{/if}
<text
  {x}
  {y}
  font-family={family}
  font-weight="700"
  font-size={size}
  textLength={w}
  lengthAdjust="spacing"
  fill={t.fg}>{text}</text
>
