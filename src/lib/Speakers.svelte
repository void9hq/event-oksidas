<script>
  import { stack, measure, fontsReady } from '../fonts.js';
  import Label from './Label.svelte';

  // Lineup block: names flow left to right, separated by an accent "/", wrapping inside w.
  // Names never break. Font size is the largest (<= fsMax) where all lines fit into h.
  let { x, y, w, h, items, t, label, ls, fsMax } = $props();

  let ready = $state(false);
  fontsReady.then(() => (ready = true));

  const LH = 1.22; // line height, em
  const SEP = '/';

  const lay = $derived.by(() => {
    ready; // re-measure once the embedded fonts are loaded
    const font = t.fonts.body;
    const names = items.map((it) => it.name);
    const nw = names.map((n) => measure(n, font, 600));
    const sw = measure(SEP, font, 400);
    const gap = 0.4; // space around separator, em
    const top = y + ls * 2.4;
    const availH = y + h - top;

    // greedy wrap at a given size; returns lines of { text, dx, sep } in em
    const wrap = (fs) => {
      const lines = [[]];
      let cur = 0;
      names.forEach((n, i) => {
        const add = (cur ? gap * 2 + sw : 0) + nw[i];
        if (cur && (cur + add) * fs > w) {
          lines.push([]);
          cur = 0;
        }
        const line = lines.at(-1);
        if (cur) line.push({ sep: true, dx: cur + gap });
        line.push({ text: n, dx: cur ? cur + gap * 2 + sw : 0 });
        cur += cur ? gap * 2 + sw + nw[i] : nw[i];
      });
      return lines;
    };

    let fs = Math.min(fsMax, w / Math.max(...nw));
    let lines = wrap(fs);
    while (fs > 4 && lines.length * fs * LH > availH) {
      fs *= 0.97;
      lines = wrap(fs);
    }
    return { fs, lines, top };
  });

  const body = $derived(stack(t.fonts.body));
</script>

<Label x={x} y={y + ls} size={ls} text={label} {t} />
{#each lay.lines as line, li}
  {@const by = lay.top + lay.fs * (0.95 + li * LH)}
  {#each line as tok}
    {#if tok.sep}
      <text x={x + tok.dx * lay.fs} y={by} font-family={body} font-weight="400" font-size={lay.fs} fill={t.accent}
        >{SEP}</text
      >
    {:else}
      <text x={x + tok.dx * lay.fs} y={by} font-family={body} font-weight="600" font-size={lay.fs} fill={t.fg}
        >{tok.text}</text
      >
    {/if}
  {/each}
{/each}
