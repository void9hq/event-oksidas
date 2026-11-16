// Output formats. w/h are the SVG user units and PNG export pixels.
// physW/physH (optional) go into the exported SVG width/height for print.
// lang: 'en' renders with eventEn. group: formats shown together in one preview row.
export const formats = [
  { id: 'a4', label: 'A4 plakatas (300 dpi)', w: 2480, h: 3508, physW: '210mm', physH: '297mm', layout: 'a4' },
  { id: 'square', label: 'Instagram 1:1', w: 1080, h: 1080, layout: 'square' },
  // Facebook event cover; page cover would be 1640x624 (needs its own layout tuning)
  { id: 'fb', label: 'Facebook renginio viršelis', w: 1920, h: 1005, layout: 'wide' },
  // UV print on a 400x300 mm landscape canvas, white background. 300 dpi = 4724x3543 px. Minimal
  // layout, English. themeGroup: 'print' = always one of the white print themes (themes.js,
  // print: true), chosen in the card's own switcher or with --uv-theme, never the main theme.
  // dots: background grid in px, 118.1 px = 10 mm and divides the sheet evenly (40 x 30
  // cells); r is the dot radius (6.5 px = 1.1 mm dots).
  {
    id: 'uv',
    label: 'UV print 400×300 mm (300 dpi)',
    w: 4724,
    h: 3543,
    physW: '400mm',
    physH: '300mm',
    layout: 'uv',
    lang: 'en',
    themeGroup: 'print',
    dots: { step: 118.1, r: 6.5 },
  },
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
