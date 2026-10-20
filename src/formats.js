// Output formats. w/h are the SVG user units and PNG export pixels.
// physW/physH (optional) go into the exported SVG width/height for print.
// lang: 'en' renders with eventEn. group: formats shown together in one preview row.
export const formats = [
  { id: 'a4', label: 'A4 plakatas (300 dpi)', w: 2480, h: 3508, physW: '210mm', physH: '297mm', layout: 'a4' },
  { id: 'square', label: 'Instagram 1:1', w: 1080, h: 1080, layout: 'square' },
  // Facebook event cover; page cover would be 1640x624 (needs its own layout tuning)
  { id: 'fb', label: 'Facebook renginio viršelis', w: 1920, h: 1005, layout: 'wide' },
  // Instagram carousel, English. The wave runs across all slides as one panorama.
  ...[1, 2, 3].map((n) => ({
    id: `carousel-${n}`,
    label: `IG carousel ${n}/3`,
    w: 1080,
    h: 1080,
    layout: 'carousel',
    slide: n - 1,
    slides: 3,
    lang: 'en',
    group: 'carousel',
  })),
];
