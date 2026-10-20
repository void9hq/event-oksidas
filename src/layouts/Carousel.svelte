<script>
  // Instagram carousel slide, 1080x1080. format.slide picks the content:
  //   0 — title, 1 — speakers, 2 — when / where / register / partners.
  // Shared on every slide: top bar, wave band and footer, all at the same y so the slides
  // join up when swiped. The wave is one band format.slides wide, each slide shows its part.
  import { stack, measure, fontsReady } from '../fonts.js';
  import { dateStr, weekday, whenSub } from '../lib/util.js';
  import Wave from '../lib/Wave.svelte';
  import Headline from '../lib/Headline.svelte';
  import TopBar from '../lib/TopBar.svelte';
  import InfoCol from '../lib/InfoCol.svelte';
  import Label from '../lib/Label.svelte';
  import Partners from '../lib/Partners.svelte';

  let { W, H, ev, t, P, seed, format } = $props();

  const m = 70;
  const cw = $derived(W - 2 * m);
  const slide = $derived(format.slide);
  const count = $derived(format.slides);
  const body = $derived(stack(t.fonts.body));
  const head = $derived(stack(t.fonts.head));

  // shared band
  const WAVE_Y = 790;
  const WAVE_H = 180;
  const FOOT_Y = 1035;

  // slide 2: two columns. Left: the longer half of the names. Right: the shorter ones plus
  // ev.speakerCut (if set), clipped to its `keep` part. Both columns keep the original speaker
  // order. Size: largest that fits both columns side by side in the content width.
  let ready = $state(false);
  fontsReady.then(() => (ready = true));
  const SP_TOP = 250;
  const SP_BOTTOM = 760;
  const GAP_EM = 1.0; // between columns
  const CUT_BLEED_EM = 0.06; // a hairline of the next letter shows, so it reads as clipped, not abbreviated
  const sp = $derived.by(() => {
    ready;
    const w = (s) => measure(s, t.fonts.body, 600);
    const cut = ev.speakerCut && ev.speakers.find((s) => s.name === ev.speakerCut.name);
    const rest = ev.speakers.filter((s) => s !== cut);
    const rows = Math.ceil(ev.speakers.length / 2);
    // shortest names go right; both columns keep the original order
    const nRight = ev.speakers.length - rows - (cut ? 1 : 0);
    const shortest = new Set([...rest].sort((a, b) => w(a.name) - w(b.name)).slice(0, nRight));
    const left = rest.filter((s) => !shortest.has(s));
    const right = ev.speakers.filter((s) => s === cut || shortest.has(s));
    const keepW = cut ? w(ev.speakerCut.keep) : 0;
    const wL = Math.max(0, ...left.map((s) => w(s.name)));
    // the clipped name counts only with its visible part
    const wR = Math.max(keepW + CUT_BLEED_EM, ...right.filter((s) => s !== cut).map((s) => w(s.name)));
    const lhMax = (SP_BOTTOM - SP_TOP) / rows;
    const fs = Math.min(lhMax / 1.3, cw / (wL + GAP_EM + wR));
    const lh = Math.min(lhMax, fs * 1.45);
    const xR = m + (wL + GAP_EM) * fs;
    const at = (col, x) =>
      col.map((s, i) => ({ name: s.name, x, y: SP_TOP + lh * i + lh * 0.5 + fs * 0.36, row: i }));
    const items = [...at(left, m), ...at(right, xR)];
    const it = cut && items.find((s) => s.name === cut.name);
    if (it) it.clip = { x: it.x - fs, y: SP_TOP + lh * it.row, w: fs + (keepW + CUT_BLEED_EM) * fs, h: lh };
    return { fs, items, bottom: SP_TOP + lh * rows };
  });

  const pad2 = (v) => String(v).padStart(2, '0');
</script>

<Wave x={-slide * W} y={WAVE_Y} w={W * count} h={WAVE_H} {seed} {t} N={600 * count} />

<TopBar x1={m} x2={W - m} y={110} size={34} {ev} {t} />

{#if slide === 0}
  <Headline x={m} y={420} w={cw} text={ev.title} {t} />
  <text x={m} y={505} font-family={body} font-weight="600" font-size={54} fill={t.fg}>{ev.subtitle}</text>
  <text x={m} y={610} font-family={body} font-weight="600" font-size={46} fill={t.accent}
    >{dateStr(ev)}<tspan dx={18} font-weight="400" fill={t.muted}>{weekday(ev)}</tspan></text
  >
  <text x={m} y={668} font-family={body} font-weight="600" font-size={36} fill={t.fg}>{ev.venue}</text>
  <text x={m} y={712} font-family={body} font-weight="400" font-size={30} fill={t.muted}>{ev.city}</text>
{:else if slide === 1}
  <Label x={m} y={215} size={24} text={ev.speakersLabel} {t} />
  {#each sp.items as s}
    {#if s.clip}
      <clipPath id="{P}-spcut"><rect x={s.clip.x} y={s.clip.y} width={s.clip.w} height={s.clip.h} /></clipPath>
    {/if}
    <text
      x={s.x}
      y={s.y}
      font-family={body}
      font-weight="600"
      font-size={sp.fs}
      fill={t.fg}
      clip-path={s.clip ? `url(#${P}-spcut)` : undefined}>{s.name}</text
    >
  {/each}
  {#if ev.speakersExtra}
    <!-- side programme under the lineup -->
    {@const y0 = sp.bottom + 70}
    <text x={m} y={y0} font-family={body} font-weight="600" font-size={36} fill={t.fg}>{ev.speakersExtra.main}</text>
    <text x={m} y={y0 + 50} font-family={body} font-weight="400" font-size={32} fill={t.muted}
      ><tspan fill={t.accent} font-weight="600">@</tspan><tspan dx={10}>{ev.speakersExtra.place}</tspan></text
    >
  {/if}
{:else}
  <InfoCol x={m} y={215} ls={24} ms={48} ss={30} label={ev.whenLabel} main={dateStr(ev)} sub={whenSub(ev)} accent {t} />
  <InfoCol x={m + cw / 2} y={215} ls={24} ms={32} ss={30} label={ev.whereLabel} main={ev.venue} sub={ev.city} {t} />

  <Label x={m} y={380} size={24} text={ev.registerLabel} {t} />
  <text x={m} y={448} font-family={head} font-weight="700" font-size={54} fill={t.fg}>{ev.url}</text>
  <text x={m} y={492} font-family={body} font-weight="400" font-size={30} fill={t.muted}>{ev.price}</text>

  <Partners
    x={m}
    y={540}
    w={cw}
    h={225}
    cols={ev.partners.length}
    items={ev.partners}
    {t}
    label={ev.partnersLabel}
    ls={24}
    fs={16}
    cs={15}
  />
{/if}

<!-- footer: site on the left, slide counter (+ swipe hint) on the right -->
<text x={m} y={FOOT_Y} font-family={head} font-weight="700" font-size={26} fill={t.muted}>{ev.url}</text>
{#if slide < count - 1}
  <!-- drawn, not a glyph: → is outside the embedded font subset -->
  <path
    d="M{W - m - 30} {FOOT_Y - 9}h28M{W - m - 12} {FOOT_Y - 19}l10 10l-10 10"
    fill="none"
    stroke={t.accent}
    stroke-width="3.5"
    stroke-linecap="square"
  />
{/if}
<text
  x={slide < count - 1 ? W - m - 46 : W - m}
  y={FOOT_Y}
  text-anchor="end"
  font-family={head}
  font-weight="700"
  font-size={26}
  fill={t.muted}>{pad2(slide + 1)} / {pad2(count)}</text
>
