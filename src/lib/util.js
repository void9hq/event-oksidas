// Seeded PRNG so a given seed always gives the same artwork.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const parseDate = (ev) => new Date(`${ev.date}T12:00:00Z`);

export const dateStr = (ev) => ev.date; // ISO as-is: 2026-10-24

export function weekday(ev) {
  const s = parseDate(ev).toLocaleDateString(ev.locale ?? 'lt-LT', { weekday: 'long', timeZone: 'UTC' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const whenSub = (ev) => (ev.time ? `${weekday(ev)} / ${ev.time}` : weekday(ev));
