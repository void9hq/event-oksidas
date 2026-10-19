<script>
  // Facebook event cover, 1920x1005.
  import { stack } from '../fonts.js';
  import { dateStr, whenSub } from '../lib/util.js';
  import Wave from '../lib/Wave.svelte';
  import Headline from '../lib/Headline.svelte';
  import TopBar from '../lib/TopBar.svelte';
  import InfoCol from '../lib/InfoCol.svelte';
  import Speakers from '../lib/Speakers.svelte';
  import Partners from '../lib/Partners.svelte';

  let { W, H, ev, t, P, seed } = $props();

  const m = 80;
  const rx = 1240; // right column start
  const body = $derived(stack(t.fonts.body));
</script>

<Wave x={0} y={500} w={W} h={150} {seed} {t} />

<TopBar x1={m} x2={W - m} y={125} size={40} {ev} {t} />
<Headline x={m} y={375} w={1040} text={ev.title} {t} />
<text x={m} y={455} font-family={body} font-weight="600" font-size={50} fill={t.fg}>{ev.subtitle}</text>

<InfoCol x={rx} y={225} ls={24} ms={56} ss={30} label={ev.whenLabel} main={dateStr(ev)} sub={whenSub(ev)} accent {t} />
<InfoCol x={rx} y={395} ls={24} ms={38} ss={30} label={ev.whereLabel} main={ev.venue} sub={ev.city} {t} />

<Speakers x={m} y={665} w={1080} h={265} items={ev.speakers} {t} label={ev.speakersLabel} ls={24} fsMax={46} />
<Partners x={rx} y={665} w={W - m - rx} h={265} cols={2} items={ev.partners} {t} label={ev.partnersLabel} ls={24} fs={20} cs={18} />
