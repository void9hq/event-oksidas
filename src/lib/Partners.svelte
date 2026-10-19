<script>
  import Label from './Label.svelte';
  import Slot from './Slot.svelte';

  // Partner logo slots inside box (x,y,w,h), label above.
  // cs = caption size (caption is drawn inside the logo plate, see Slot).
  let { x, y, w, h, cols, items, t, label, ls, fs, cs = fs } = $props();

  const g = $derived.by(() => {
    const labelH = ls * 2.2;
    const a = { x, y: y + labelH, w, h: h - labelH };
    const rows = Math.ceil(items.length / cols);
    const gap = Math.min(a.w * 0.03, a.h * 0.25);
    const sw = (a.w - gap * (cols - 1)) / cols;
    const sh = (a.h - gap * (rows - 1)) / rows;
    return items.map((it, i) => ({
      ...it,
      x: a.x + (i % cols) * (sw + gap),
      y: a.y + Math.floor(i / cols) * (sh + gap),
      w: sw,
      h: sh,
    }));
  });
</script>

<Label x={x} y={y + ls} size={ls} text={label} {t} />
{#each g as c}
  <Slot x={c.x} y={c.y} w={c.w} h={c.h} {t} href={c.logo} wordmark={c.wordmark} text={c.name || 'LOGO'} caption={c.caption} {cs} {fs} />
{/each}
