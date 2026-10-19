<script>
  // Event page. Content comes from the same event.js / themes.js as the posters.
  import { onMount } from 'svelte';
  import { event as ev } from '../src/event.js';
  import { themes } from '../src/themes.js';
  import { dateStr, whenSub } from '../src/lib/util.js';
  import { webStack } from '../src/fonts.js';
  import Wave from '../src/lib/Wave.svelte';
  import Rsvp from './Rsvp.svelte';

  const THEME = 'rust';
  const SEED = 7;

  const t = themes.find((x) => x.id === THEME) ?? themes[0];
  const vars = Object.entries({ bg: t.bg, panel: t.panel, fg: t.fg, muted: t.muted, accent: t.accent, accent2: t.accent2, line: t.line, plate: t.plate })
    .map(([k, v]) => `--${k}:${v}`)
    .join(';');

  // Wave parallax: pointer position -> --px/--py (-1..1), eased per frame; the loop stops once settled.
  const PARALLAX = 70; // max shift of the front trace, svg units (band is 1600 wide)
  let waveEl;
  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      waveEl.style.setProperty('--px', cx.toFixed(4));
      waveEl.style.setProperty('--py', cy.toFixed(4));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e) => {
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = (e.clientY / innerHeight) * 2 - 1;
      raf ||= requestAnimationFrame(tick);
    };
    addEventListener('pointermove', move, { passive: true });
    return () => {
      removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
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
      >{dateStr(ev)}{#if ev.price}<span class="sl">//</span><span class="price">{ev.price}</span>{/if}</span
    >
  </header>

  <section class="hero wrap">
    <h1>{ev.title}</h1>
    <p class="sub">{ev.subtitle}</p>
  </section>

  <div class="wave" aria-hidden="true" bind:this={waveEl}>
    <!-- traces drawn wider than the view so shifted ends never show; ticks kept static -->
    <svg viewBox="0 0 1600 260" preserveAspectRatio="xMidYMid slice">
      <Wave x={-100} y={0} w={1800} h={260} seed={SEED} {t} parallax={PARALLAX} />
    </svg>
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
                  style="font-family:{webStack(p.wordmark.font)};font-weight:{p.wordmark.weight ?? 400};letter-spacing:{p.wordmark.spacing ?? 0}em"
                  >{p.name}</span
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

  <footer class="wrap muted">{ev.organizer} / {ev.date}</footer>
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
  .wave svg {
    display: block;
    width: 100%;
    height: clamp(120px, 18vw, 260px);
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
  footer {
    padding-bottom: 32px;
    font-size: 14px;
  }
</style>
