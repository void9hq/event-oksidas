<script>
  // Event page. Content comes from the same event.js / themes.js as the posters.
  import { onMount } from 'svelte';
  import { event as ev } from '../src/event.js';
  import { themes } from '../src/themes.js';
  import { dateStr, whenSub } from '../src/lib/util.js';
  import { webStack } from '../src/fonts.js';
  import Wave from '../src/lib/Wave.svelte';
  import { frontFold } from '../src/lib/wavemath.js';
  import { createTone, toneSupported, NOTES } from './tone.js';
  import Rsvp from './Rsvp.svelte';

  const THEME = 'rust';
  const SEED = 7;

  const t = themes.find((x) => x.id === THEME) ?? themes[0];
  const vars = Object.entries({ bg: t.bg, panel: t.panel, fg: t.fg, muted: t.muted, accent: t.accent, accent2: t.accent2, line: t.line, plate: t.plate })
    .map(([k, v]) => `--${k}:${v}`)
    .join(';');

  // ---- the hero wave is playable --------------------------------------------------------------
  //  - parallax: pointer -> --px/--py on the band (CSS does the per-trace shift)
  //  - knob: pointer x = fold amount, pointer y = cycles across the band (and pitch when sound is on)
  //  - drift: the pattern travels slowly; faster while the tone plays
  //  - tone: button toggles a one-voice synth built from the same recipe (tone.js)
  // One rAF loop, only while the band is on screen. Reduced motion: no parallax, no drift.
  const PARALLAX = 70; // max shift of the front trace, svg units (band is 1600 wide)
  const SEED_NOTE = 0.5; // pointer resting position until the first move (centre = the poster look)

  const live = $state({ phase: 0, fold: 1, freq: 1, amp: 1, hot: 0 }); // Wave.svelte redraws on change
  let waveEl;
  let canSound = $state(false);
  let sound = $state(false);

  const tone = createTone(SEED);
  let nx = SEED_NOTE; // pointer over the viewport, 0..1
  let ny = SEED_NOTE;
  let sentNote = -1;
  let sentK = 0;
  const targetNote = () => Math.min(NOTES - 1, Math.max(0, Math.floor((1 - ny) * NOTES)));

  async function toggleSound() {
    if (sound) {
      sound = false;
      tone.stop();
      return;
    }
    sentNote = targetNote();
    sentK = frontFold(t, live.fold);
    sound = await tone.start(sentNote, sentK);
  }

  onMount(() => {
    canSound = toneSupported();
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let px = 0, py = 0; // eased parallax
    let visible = false;
    let raf = 0;
    let last = 0;

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const ease = 1 - Math.exp(-dt * 5);

      if (!still) {
        px += (nx * 2 - 1 - px) * ease;
        py += (ny * 2 - 1 - py) * ease;
        waveEl.style.setProperty('--px', px.toFixed(4));
        waveEl.style.setProperty('--py', py.toFixed(4));
      }

      // knob targets: centre of the screen = the poster look (1, 1)
      const foldT = 0.4 + 1.2 * nx;
      const freqT = sound ? 0.5 + targetNote() / (NOTES - 1) : 1.5 - ny;
      live.fold += (foldT - live.fold) * ease;
      live.freq += (freqT - live.freq) * ease;

      const hotT = sound ? 1 : 0;
      live.hot += (hotT - live.hot) * (1 - Math.exp(-dt * 6));
      live.amp = 1 + 0.15 * live.hot;
      if (!still) live.phase += dt * (0.22 + 1.6 * live.hot);

      if (sound) {
        const n = targetNote();
        const k = frontFold(t, live.fold);
        if (n !== sentNote || Math.abs(k - sentK) > 0.05) {
          tone.set(n, k);
          sentNote = n;
          sentK = k;
        }
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const move = (e) => {
      nx = e.clientX / innerWidth;
      ny = e.clientY / innerHeight;
    };
    const quiet = () => {
      if (!sound) return;
      sound = false;
      tone.stop();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        last = performance.now();
        raf ||= requestAnimationFrame(frame);
      } else {
        quiet(); // the wave is the instrument: off screen, no drone
      }
    });
    io.observe(waveEl);
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden && quiet());

    return () => {
      io.disconnect();
      removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
      quiet();
    };
  });

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ev.venue}, ${ev.city}`)}`;
  // empty placeholders are for the posters only
  const partners = ev.partners.filter((p) => p.logo || p.name);
</script>

<div class="page" style={vars}>
  <header class="top wrap">
    <span><span class="org">{ev.organizer}</span> <span class="muted">{ev.presents}</span></span>
    <span class="topdate"
      ><span>{dateStr(ev)}</span>{#if ev.price}<span class="pr"><span class="sl">//</span><span class="price">{ev.price}</span></span
        >{/if}</span
    >
  </header>

  <section class="hero wrap">
    <h1>{ev.title}</h1>
    <p class="sub">{ev.subtitle}</p>
  </section>

  <div class="stage">
    <div class="wave" aria-hidden="true" bind:this={waveEl}>
      <!-- traces drawn wider than the view so shifted ends never show; ticks kept static -->
      <svg viewBox="0 0 1600 260" preserveAspectRatio="xMidYMid slice">
        <Wave x={-100} y={0} w={1800} h={260} seed={SEED} {t} parallax={PARALLAX} N={360} {live} />
      </svg>
    </div>
    {#if canSound}
      <div class="tonebar wrap">
        <button class="tone" aria-pressed={sound} onclick={toggleSound}>
          <span class="sl">//</span>{sound ? 'Sustabdyti' : 'Paleisti toną'}
        </button>
      </div>
    {/if}
  </div>

  <section class="info wrap">
    <div>
      <h2>{ev.whenLabel}</h2>
      <p class="big accent">{dateStr(ev)}</p>
      <p class="muted">{whenSub(ev)}</p>
    </div>
    <div>
      <h2>{ev.whereLabel}</h2>
      <p class="big">{ev.venue}</p>
      <p class="muted">{ev.city} / <a href={mapUrl} target="_blank" rel="noopener">Žemėlapis</a></p>
    </div>
  </section>

  <section class="wrap">
    <h2>{ev.speakersLabel}</h2>
    <ul class="lineup">
      {#each ev.speakers as s}<li>{s.name}</li>{' '}{/each}
    </ul>
  </section>

  <section class="wrap" id="registracija">
    <h2>Registracija</h2>
    <Rsvp />
  </section>

  {#if partners.length}
    <section class="wrap">
      <h2>{ev.partnersLabel}</h2>
      <ul class="partners">
        {#each partners as p}
          <li>
            <!-- link only when the partner has a url -->
            <svelte:element
              this={p.url ? 'a' : 'div'}
              href={p.url}
              target={p.url ? '_blank' : undefined}
              rel={p.url ? 'noopener' : undefined}
              class="plate"
            >
              {#if p.caption}<span class="cap">{p.caption}</span>{/if}
              {#if p.logo}
                <img src={p.logo} alt={p.name || 'Partneris'} />
              {:else if p.wordmark}
                <span
                  class="wm"
                  class:stack={p.wordmark.lines}
                  aria-label={p.name}
                  style="font-family:{webStack(p.wordmark.font)};font-weight:{p.wordmark.weight ?? 400};letter-spacing:{p.wordmark.spacing ?? 0}em"
                  >{#each p.wordmark.lines ?? [p.name] as l}<span>{l}</span>{/each}</span
                >
              {:else}
                <span class="wm">{p.name}</span>
              {/if}
            </svelte:element>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</div>

<style>
  :global(html, body) {
    margin: 0;
    background: #15110e;
  }
  .page {
    --head: 'Victor Mono', monospace;
    --body: 'IBM Plex Sans', system-ui, sans-serif;
    --pad: clamp(20px, 5vw, 56px);
    min-height: 100vh;
    background-color: var(--bg);
    /* same dot grid as the posters */
    background-image: radial-gradient(var(--line) 1px, transparent 1.4px);
    background-size: 28px 28px;
    color: var(--fg);
    font: 400 18px/1.5 var(--body);
  }
  .wrap {
    max-width: 1080px;
    margin-inline: auto;
    padding: 0 var(--pad);
    box-sizing: border-box;
  }
  .muted {
    color: var(--muted);
  }
  .accent {
    color: var(--accent);
  }
  a {
    color: var(--accent);
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-top: 28px;
    padding-bottom: 14px;
    /* rule under the bar, inset by the side padding */
    background: linear-gradient(var(--line), var(--line)) bottom / calc(100% - 2 * var(--pad)) 1px no-repeat;
  }
  .org {
    font: 700 22px var(--head);
  }
  .topdate .sl {
    margin: 0 0.4em 0 0.5em;
    font: 700 1em var(--head);
    color: var(--accent);
  }
  .topdate .price {
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .topdate {
    font-weight: 600;
  }
  /* phones: date and price on separate lines, right-aligned */
  @media (max-width: 600px) {
    .top {
      align-items: flex-start;
    }
    .topdate {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
    }
    .topdate .sl {
      margin-left: 0;
    }
  }
  .hero {
    padding-top: 8px;
  }
  .hero h1 {
    margin: 0;
    font: 700 clamp(64px, calc((min(100vw, 1080px) - 2 * var(--pad)) / 4.3), 250px) / 1 var(--head);
    text-shadow: 0.035em 0.035em 0 var(--accent2);
  }
  .sub {
    margin: 0.2em 0 0;
    font-weight: 600;
    font-size: clamp(22px, 4vw, 40px);
    line-height: 1.2;
  }
  /* Parallax shifts the traces, so they must be allowed to draw outside the svg box (the strongest
     traces already reach the box edge). Height follows width (16.25vw = 260/1600), so "slice" only
     crops sideways on phones. clip-path trims the sides to the page, the generous top/bottom
     inset keeps the shifted traces whole. */
  .wave {
    clip-path: inset(-120px 0);
  }
  .stage {
    position: relative;
  }
  /* sound toggle: over the lower right of the band, aligned to the content column */
  .tonebar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 6px;
    display: flex;
    justify-content: flex-end;
    pointer-events: none;
  }
  .tone {
    pointer-events: auto;
    font: 600 13px var(--body);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 10px 14px;
    cursor: pointer;
  }
  .tone .sl {
    font: 700 1em var(--head);
    letter-spacing: 0;
    margin-right: 0.6em;
  }
  .tone[aria-pressed='true'] {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }
  .tone:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .wave svg {
    display: block;
    width: 100%;
    height: clamp(120px, 16.25vw, 520px);
    overflow: visible;
    pointer-events: none;
  }
  section {
    margin-bottom: 56px;
  }
  h2 {
    margin: 0 0 14px;
    font: 600 14px var(--body);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
  }
  h2::before {
    content: '//';
    font-family: var(--head);
    font-weight: 700;
    letter-spacing: 0;
    margin-right: 0.6em;
  }
  .info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 32px;
  }
  .info p {
    margin: 0;
  }
  .big {
    font-weight: 600;
    font-size: clamp(24px, 3.4vw, 34px);
    line-height: 1.2;
  }
  .lineup {
    list-style: none;
    margin: 0;
    padding: 0;
    font-weight: 600;
    font-size: clamp(24px, 3.6vw, 40px);
    line-height: 1.3;
  }
  /* names never break; lines wrap only at the space after a separator */
  .lineup li {
    display: inline;
    white-space: nowrap;
  }
  .lineup li:not(:last-child)::after {
    content: ' /';
    font-weight: 400;
    color: var(--accent);
  }
  .partners {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 24px 40px;
    align-items: flex-start;
  }
  /* same light plate as the posters, so brand colours stay legible on dark themes */
  .partners .plate {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 200px;
    height: 110px;
    padding: 12px 22px 16px;
    box-sizing: border-box;
    background: var(--plate);
    border-radius: 6px;
    text-decoration: none;
  }
  /* caption sits on the light plate, so it needs a dark colour */
  .partners .cap {
    font-size: 13px;
    line-height: 1.2;
    color: #5f574f;
  }
  /* stacked wordmark: each line on its own row, left-aligned block */
  .partners .wm.stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 30px;
    line-height: 0.98;
  }
  .partners .wm {
    font-size: 22px;
    line-height: 1;
    color: #1b1714;
    white-space: nowrap;
  }
  .partners img {
    display: block;
    min-height: 0;
    max-width: 100%;
    max-height: 100%;
  }
  /* phones: 2x2 grid instead of a single column */
  @media (max-width: 600px) {
    .partners {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .partners .plate {
      width: 100%;
      padding-inline: 12px;
    }
  }
</style>
