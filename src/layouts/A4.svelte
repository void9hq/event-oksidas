<script>
  // A4 portrait, 2480x3508 (300 dpi). All numbers are px in that space.
  import { stack } from '../fonts.js';
  import { dateStr, whenSub } from '../lib/util.js';
  import Wave from '../lib/Wave.svelte';
  import Headline from '../lib/Headline.svelte';
  import TopBar from '../lib/TopBar.svelte';
  import InfoCol from '../lib/InfoCol.svelte';
  import Speakers from '../lib/Speakers.svelte';
  import Partners from '../lib/Partners.svelte';

  let { W, H, ev, t, P, seed } = $props();

  const m = 170;
  const cw = $derived(W - 2 * m);
  const body = $derived(stack(t.fonts.body));
</script>

<Wave x={0} y={960} w={W} h={680} {seed} {t} />

<TopBar x1={m} x2={W - m} y={230} size={64} {ev} {t} />
<Headline x={m} y={760} w={cw} text={ev.title} {t} />
<text x={m} y={900} font-family={body} font-weight="600" font-size={112} fill={t.fg}>{ev.subtitle}</text>

<InfoCol x={m} y={1770} ls={44} ms={120} ss={64} label={ev.whenLabel} main={dateStr(ev)} sub={whenSub(ev)} accent {t} />
<InfoCol x={m + cw / 2} y={1770} ls={44} ms={76} ss={64} label={ev.whereLabel} main={ev.venue} sub={ev.city} {t} />

<Speakers x={m} y={2160} w={cw} h={780} items={ev.speakers} {t} label={ev.speakersLabel} ls={44} fsMax={107} />
<Partners x={m} y={3000} w={cw} h={338} cols={ev.partners.length} items={ev.partners} {t} label={ev.partnersLabel} ls={44} fs={36} cs={34} />
