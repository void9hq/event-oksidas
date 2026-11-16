<script>
  import { fontCss } from '../fonts.js';

  // step: grid dot spacing in user units, dotR: dot radius (default step * 0.045);
  // extraFonts: font ids used by partner wordmarks
  let { t, P, step, dotR = undefined, extraFonts = [] } = $props();

  const css = $derived(fontCss([t.fonts.head, t.fonts.body, ...extraFonts]));
</script>

<defs>
  {@html `<style>${css}</style>`}
  <pattern id="{P}-grid" width={step} height={step} patternUnits="userSpaceOnUse">
    <circle cx={step / 2} cy={step / 2} r={dotR ?? step * 0.045} fill={t.line} />
  </pattern>
</defs>
