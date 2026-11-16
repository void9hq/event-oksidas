<script>
  import Artwork from './Artwork.svelte';
  import { event, eventEn } from './event.js';
  import { themes, screenThemes, printThemes } from './themes.js';
  import { formats } from './formats.js';
  import { saveSvg, savePng } from './export.js';

  // state survives reloads via URL hash: #theme=rust&seed=7&uv=sun&subtitle=Optional+override
  const q = new URLSearchParams(location.hash.slice(1));
  let themeId = $state(q.get('theme') ?? screenThemes[0].id);
  let uvId = $state(q.get('uv') ?? printThemes[0].id); // theme of the UV print card
  let seed = $state(Number(q.get('seed') ?? 7));
  const subtitle = q.get('subtitle')?.trim() || ''; // replaces the subtitle on every format (npm run export --subtitle)
  const els = $state({});

  const theme = $derived(themes.find((x) => x.id === themeId) ?? screenThemes[0]);
  const printTheme = $derived(printThemes.find((x) => x.id === uvId) ?? printThemes[0]);

  $effect(() => {
    const p = new URLSearchParams({ theme: themeId, seed: String(seed) });
    if (printTheme.id !== printThemes[0].id) p.set('uv', printTheme.id);
    if (subtitle) p.set('subtitle', subtitle);
    history.replaceState(null, '', `#${p}`);
  });

  // print formats (UV) use the print theme picked in their own card, everything else the main one
  const themeFor = (f) => (f.themeGroup === 'print' ? printTheme : theme);
  const fname = (f) => `oksidas-${f.id}-${themeFor(f).id}-${seed}`;
  const evFor = (f) => {
    const e = f.lang === 'en' ? eventEn : event;
    return subtitle ? { ...e, subtitle } : e;
  };

  // formats without a group get their own cell; grouped ones share a full-width row
  const cells = $derived.by(() => {
    const out = [];
    for (const f of formats) {
      const last = out.at(-1);
      if (f.group && last?.group === f.group) last.items.push(f);
      else out.push({ group: f.group, items: [f] });
    }
    return out;
  });
</script>

{#snippet card(f)}
  <section class={f.layout} data-id={f.id}>
    <div class="bar">
      <span>{f.label} / {f.w}×{f.h}</span>
      {#if f.themeGroup === 'print'}
        <div class="group" role="radiogroup" aria-label="UV tema">
          {#each printThemes as th}
            <button
              role="radio"
              aria-checked={th.id === printTheme.id}
              class:active={th.id === printTheme.id}
              onclick={() => (uvId = th.id)}
            >
              <!-- dots colour as fill, wave colour as outline -->
              <span class="sw" style="background:{th.line};border-color:{th.accent}"></span>{th.name}
            </button>
          {/each}
        </div>
      {/if}
      <button onclick={() => saveSvg(els[f.id], fname(f))}>SVG</button>
      <button onclick={() => savePng(els[f.id], f.w, f.h, fname(f))}>PNG</button>
    </div>
    <div class="frame">
      <Artwork format={f} theme={themeFor(f)} ev={evFor(f)} {seed} bind:svgEl={els[f.id]} />
    </div>
  </section>
{/snippet}

<header>
  <strong>OKSIDAS</strong>
  <div class="group" role="radiogroup" aria-label="Tema">
    {#each screenThemes as th}
      <button
        role="radio"
        aria-checked={th.id === themeId}
        class:active={th.id === themeId}
        onclick={() => (themeId = th.id)}
      >
        <span class="sw" style="background:{th.bg};border-color:{th.accent}"></span>{th.name}
      </button>
    {/each}
  </div>
  <label>
    Seed
    <input type="number" bind:value={seed} min="0" />
  </label>
  <button onclick={() => (seed = Math.floor(Math.random() * 100000))}>Atsitiktinis</button>
</header>

<main>
  {#each cells as c}
    {#if c.group}
      <div class="row">
        {#each c.items as f}{@render card(f)}{/each}
      </div>
    {:else}
      {@render card(c.items[0])}
    {/if}
  {/each}
</main>

<style>
  :global(body) {
    margin: 0;
    background: #2a2a2a;
    color: #ddd;
    font: 14px/1.4 system-ui, sans-serif;
  }
  header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    padding: 10px 16px;
    background: #1c1c1c;
    border-bottom: 1px solid #333;
  }
  .group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  button {
    background: #333;
    color: #ddd;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
    font: inherit;
  }
  button:hover {
    background: #3d3d3d;
  }
  button.active {
    border-color: #ddd;
  }
  .sw {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 6px;
    border: 2px solid;
    vertical-align: -1px;
  }
  input {
    width: 80px;
    background: #333;
    color: #ddd;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 3px 6px;
  }
  main {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: start;
    gap: 24px;
    padding: 24px;
  }
  section.wide,
  section.uv,
  .row {
    grid-column: 1 / -1;
  }
  /* carousel slides touch, so the running wave reads as one strip */
  .row {
    display: flex;
    gap: 0;
  }
  .row .bar {
    padding-right: 12px;
  }
  .carousel .frame :global(svg) {
    width: min(30vw, 45vh);
    height: auto;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
  }
  .bar span {
    margin-right: auto;
  }
  .frame :global(svg) {
    display: block;
    box-shadow: 0 4px 20px #0008;
  }
  .a4 .frame :global(svg) {
    height: 80vh;
    width: auto;
  }
  .uv .frame :global(svg) {
    width: min(100%, 1100px);
    height: auto;
  }
  .square .frame :global(svg) {
    width: 45vh;
    height: auto;
  }
  .wide .frame :global(svg) {
    width: min(100%, 1100px);
    height: auto;
  }
</style>
