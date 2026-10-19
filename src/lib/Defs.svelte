<script>
  import { fontCss } from '../fonts.js';

  // step: grid dot spacing in user units; extraFonts: font ids used by partner wordmarks
  let { t, P, step, extraFonts = [] } = $props();

  const css = $derived(fontCss([t.fonts.head, t.fonts.body, ...extraFonts]));
</script>

<defs>
  {@html `<style>${css}</style>`}
  <pattern id="{P}-grid" width={step} height={step} patternUnits="userSpaceOnUse">
    <circle cx={step / 2} cy={step / 2} r={step * 0.045} fill={t.line} />
  </pattern>
</defs>
