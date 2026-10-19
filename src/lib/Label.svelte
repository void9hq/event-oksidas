<script>
  import { stack } from '../fonts.js';

  // Section label: accent "//" + spaced uppercase text. y is the baseline.
  let { x, y, size, text, t } = $props();

  // Victor Mono advance is 0.6em, so "//" is 1.2em wide; +0.5em gap
  const dx = $derived(size * 1.7);
</script>

<text {x} {y} font-family={stack(t.fonts.head)} font-weight="700" font-size={size} fill={t.accent}>//</text>
<text
  x={x + dx}
  {y}
  font-family={stack(t.fonts.body)}
  font-weight="600"
  font-size={size}
  letter-spacing={size * 0.18}
  fill={t.accent}>{text.toUpperCase()}</text
>
