<script>
  import { stack } from '../fonts.js';
  import { dateStr } from './util.js';

  // "VOID9 pristato ......... 2026-10-24 // NEMOKAMAI" with a rule under it. y is the baseline.
  let { x1, x2, y, size, ev, t } = $props();

  const ds = $derived(size * 0.8);
</script>

<text x={x1} {y} font-family={stack(t.fonts.head)} font-weight="700" font-size={size} fill={t.fg}
  >{ev.organizer}<tspan
    dx={size * 0.4}
    font-family={stack(t.fonts.body)}
    font-weight="400"
    font-size={ds}
    fill={t.muted}>{ev.presents}</tspan
  ></text
>
<text x={x2} {y} text-anchor="end" font-family={stack(t.fonts.body)} font-weight="600" font-size={ds} fill={t.fg}
  >{dateStr(ev)}{#if ev.price}<tspan dx={ds * 0.5} font-family={stack(t.fonts.head)} font-weight="700" fill={t.accent}
      >//</tspan
    ><tspan dx={ds * 0.4} letter-spacing={ds * 0.08}>{ev.price.toUpperCase()}</tspan>{/if}</text
>
<line {x1} {x2} y1={y + size * 0.7} y2={y + size * 0.7} stroke={t.line} stroke-width={size * 0.05} />
