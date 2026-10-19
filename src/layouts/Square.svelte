<script>
  // Instagram square, 1080x1080.
  import { stack } from '../fonts.js';
  import { dateStr } from '../lib/util.js';
  import Wave from '../lib/Wave.svelte';
  import Headline from '../lib/Headline.svelte';
  import TopBar from '../lib/TopBar.svelte';
  import Speakers from '../lib/Speakers.svelte';
  import Partners from '../lib/Partners.svelte';

  let { W, H, ev, t, P, seed } = $props();

  const m = 70;
  const cw = $derived(W - 2 * m);
  const body = $derived(stack(t.fonts.body));
  const logos = $derived(ev.partners.filter((p) => p.logo || p.wordmark));
</script>

<Wave x={0} y={470} w={W} h={130} {seed} {t} />

<TopBar x1={m} x2={W - m} y={110} size={34} {ev} {t} />
<Headline x={m} y={330} w={cw} text={ev.title} {t} />
<text x={m} y={395} font-family={body} font-weight="600" font-size={40} fill={t.fg}>{ev.subtitle}</text>
<text x={m} y={450} font-family={body} font-weight="600" font-size={32} fill={t.accent}
  >{dateStr(ev)}<tspan dx={16} font-weight="400" fill={t.muted}>{ev.venue}</tspan></text
>

<Speakers x={m} y={615} w={cw} h={235} items={ev.speakers} {t} label={ev.speakersLabel} ls={20} fsMax={48} />
<!-- real logos only: empty placeholder slots would shrink them below phone legibility -->
<Partners
  x={m}
  y={865}
  w={cw}
  h={155}
  cs={15}
  cols={Math.max(2, logos.length)}
  items={logos}
  {t}
  label={ev.partnersLabel}
  ls={20}
  fs={16}
/>
