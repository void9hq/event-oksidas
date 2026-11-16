<script>
  // UV print, 400x300 mm landscape (4724x3543 px at 300 dpi, 1 px = 0.0847 mm). Minimal: title,
  // subtitle, a long wave and the organizer in one bottom corner. No date, venue or speakers on
  // purpose, and no scope tick marks.
  import { stack, measure, fontsReady } from '../fonts.js';
  import Wave from '../lib/Wave.svelte';
  import Headline from '../lib/Headline.svelte';

  let { W, H, ev, t, seed } = $props();

  const m = 240; // 20 mm margin
  const cw = $derived(W - 2 * m);
  const body = $derived(stack(t.fonts.body));
  const head = $derived(stack(t.fonts.head));

  // The subtitle can be replaced from the command line (--subtitle), so it must never run off
  // the sheet: shrink it when it would be wider than the margins allow.
  const SUB_SIZE = 190;
  const SUB_DX = 50; // subtitle starts this far right of the margin
  let ready = $state(false);
  fontsReady.then(() => (ready = true));
  const subSize = $derived.by(() => {
    ready; // measure again once the embedded fonts are in
    const wide = measure(ev.subtitle, t.fonts.body, 600) * SUB_SIZE;
    const room = cw - SUB_DX;
    return wide > room ? (SUB_SIZE * room) / wide : SUB_SIZE;
  });

  const CORNER = 'right'; // where the organizer sits: 'left' | 'right'
  const ORG_SIZE = 260;

  // The wave is drawn a little wider than the sheet, like on the website, so its ends are cut
  // off instead of tapering inside the margins. Wide and flat reads as a long wave: the band
  // is ~6.5:1, close to the 6.9:1 of the website.
  const WAVE_Y = 1900;
  const WAVE_H = 920;
  // The loud burst sits in the middle of the band. SHIFT moves it off-centre, as a fraction of
  // the sheet width (negative = left, positive = right). The band grows to still cover the sheet.
  const SHIFT = -0.2;
  const bleed = $derived(W * 0.0625);
  const shift = $derived(Math.abs(SHIFT) * W);
  const waveW = $derived(W + 2 * bleed + 2 * shift);
  const waveX = $derived(SHIFT < 0 ? -bleed - 2 * shift : -bleed);
  const waveN = $derived(Math.round((1400 * waveW) / (W + 2 * bleed))); // same point density

  // black copy of the front line, a bit up-left of the teal one (the headline's shadow is
  // teal, down-right of the black text): px, 1 mm = 11.8 px.
  // width: multiplies the front line's width (1 = as thick as the teal line).
  const overlay = $derived({ color: t.fg, dx: -26, dy: -16, width: 0.45 });
</script>

<!-- weight 2.6: back lines ~0.6 mm, front line ~1.4 mm -->
<Wave x={waveX} y={WAVE_Y} w={waveW} h={WAVE_H} {seed} {t} N={waveN} ticks={false} weight={3.6} {overlay} />

<Headline x={m} y={1140} w={cw} text={ev.title} {t} />
<text x={m + SUB_DX} y={1520} font-family={body} font-weight="600" font-size={subSize} fill={t.fg}>{ev.subtitle}</text>

<!-- Victor Mono has no weight above 700, so the extra stroke makes it heavier -->
<text
  x={CORNER === 'right' ? W - m : m}
  y={H - m}
  text-anchor={CORNER === 'right' ? 'end' : 'start'}
  font-family={head}
  font-weight="700"
  font-size={ORG_SIZE}
  fill={t.fg}
  stroke={t.fg}
  stroke-width={ORG_SIZE * 0.04}
  stroke-linejoin="round">{ev.organizer}</text
>
