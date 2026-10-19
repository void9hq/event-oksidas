<script>
  import { stack } from '../fonts.js';
  import Label from './Label.svelte';

  // Label / main line / sub line. y is the label baseline.
  let { x, y, ls, ms, ss, label, main, sub, accent = false, t } = $props();

  const body = $derived(stack(t.fonts.body));
  const y1 = $derived(y + ms * 1.3);
</script>

<Label {x} {y} size={ls} text={label} {t} />
<text {x} y={y1} font-family={body} font-weight="600" font-size={ms} fill={accent ? t.accent : t.fg}>{main}</text>
<text {x} y={y1 + ss * 1.5} font-family={body} font-weight="400" font-size={ss} fill={t.muted}>{sub}</text>
