// Themes are plain data. Add one by copying an entry.
//   panel   — placeholder fill
//   line    — rules, dashed frames, grid dots
//   plate   — light backing behind partner logos (logos keep their own colours)
//   grid    — dot grid opacity (0 = off)
//   wave    — oscilloscope band: line count, fold = how "oxidized" the last trace gets, opacity,
//             floor (optional) = opacity of the faintest trace
//   print   — true for the white UV print themes (kept out of the main theme switcher)
//   shadow  — opacity of the offset headline copy in accent2 (0 = off)
//   fonts   — keys from fonts.js
const base = {
  fonts: { head: 'victor', body: 'plex' },
  grid: 0.5,
  wave: { lines: 12, fold: 1, opacity: 0.9 },
  shadow: 1,
};

// shared by the UV print themes below
const uv = {
  ...base,
  print: true,
  bg: '#ffffff',
  grid: 1,
  // floor: opacity of the faintest back trace (default 0.2); kept high so no line is a ghost in print
  wave: { lines: 12, fold: 1, opacity: 1, floor: 0.5 },
};

export const themes = [
  {
    ...base,
    id: 'rust',
    name: 'Rūdis',
    bg: '#15110e',
    panel: '#201914',
    fg: '#f3ebe2',
    plate: '#f3ebe2',
    muted: '#9a8d80',
    accent: '#e2582b',
    accent2: '#3fb59c',
    line: '#4a3d33',
  },
  {
    ...base,
    id: 'patina',
    name: 'Patina',
    bg: '#0d1917',
    panel: '#13241f',
    fg: '#e6f2ec',
    plate: '#e6f2ec',
    muted: '#7f9a91',
    accent: '#5ad1ad',
    accent2: '#d0703f',
    line: '#284039',
  },
  {
    ...base,
    id: 'paper',
    name: 'Popierius',
    bg: '#eee8dd',
    panel: '#e4ddd0',
    fg: '#1b1714',
    plate: '#faf7f1',
    muted: '#6d655c',
    accent: '#cf4a1c',
    accent2: '#1f7a68',
    line: '#bcb1a1',
    grid: 0.7,
  },
  {
    ...base,
    id: 'mono',
    name: 'Mono',
    bg: '#0a0a0a',
    panel: '#151515',
    fg: '#fafafa',
    plate: '#fafafa',
    muted: '#8a8a8a',
    accent: '#fafafa',
    accent2: '#555555',
    line: '#333333',
    wave: { lines: 12, fold: 1, opacity: 0.7 },
  },
  // ---- UV print themes (print: true) -------------------------------------------------------
  // Shown in the UV card's own switcher, not in the main one; pick with --uv-theme on export.
  // bg must stay exactly #ffffff. Same oxide mood as the screen themes, but brighter inks that
  // hold up on white. fg is a near-black tinted toward the palette (also the headline, VOID9 and
  // the overlay line on the wave). accent = back traces, accent2 = front trace and headline
  // shadow, line = background dots (light enough that the wave stays the hero).
  {
    ...uv,
    id: 'uv',
    name: 'UV',
    panel: '#f3f0ec',
    fg: '#111111',
    plate: '#f3f0ec',
    muted: '#8a8178',
    accent: '#ff5a1f',
    accent2: '#00b39a',
    line: '#c9c2b9',
  },
  {
    ...uv,
    id: 'sun',
    name: 'Sun',
    panel: '#fff8e0',
    fg: '#1a1205', // warm dark brown
    plate: '#fff8e0',
    muted: '#8a7f5c',
    accent: '#ff8200', // amber traces
    accent2: '#ff3b1f', // red front line and headline shadow
    line: '#ffd21f', // yellow dots
  },
  {
    ...uv,
    id: 'verdigris',
    name: 'Verdigris',
    panel: '#eef7f4',
    fg: '#0d1a17',
    plate: '#eef7f4',
    muted: '#6f8a83',
    accent: '#00a88f', // swapped: teal traces, copper front line
    accent2: '#ff5a1f',
    line: '#a9ddcc',
  },
  {
    ...uv,
    id: 'cobalt',
    name: 'Cobalt',
    panel: '#eef0ff',
    fg: '#0a0f2c',
    plate: '#eef0ff',
    muted: '#6a70a0',
    accent: '#2f4bff',
    accent2: '#ff3b30',
    line: '#b3bdff',
  },
  {
    ...uv,
    id: 'magenta',
    name: 'Magenta',
    panel: '#fff0f7',
    fg: '#1d0b17',
    plate: '#fff0f7',
    muted: '#a0708a',
    accent: '#ff2e93',
    accent2: '#ffb000',
    line: '#ffb3d6',
  },
  {
    ...uv,
    id: 'violet',
    name: 'Violet',
    panel: '#f4eeff',
    fg: '#160a2e',
    plate: '#f4eeff',
    muted: '#7d6ea3',
    accent: '#7b2dff',
    accent2: '#b4e000', // lime front line and headline shadow
    line: '#d6c4ff',
  },
  {
    // one black-ish ink plus one spot colour: the cheapest to print
    ...uv,
    id: 'ink',
    name: 'Ink',
    panel: '#f2f2f2',
    fg: '#0f0f0f',
    plate: '#f2f2f2',
    muted: '#808080',
    accent: '#2b2b2b', // graphite traces
    accent2: '#ff4b14', // signal-orange front line and headline shadow
    line: '#d6d6d6',
  },
  {
    ...uv,
    id: 'ocean',
    name: 'Ocean',
    panel: '#ecf7fd',
    fg: '#06202e',
    plate: '#ecf7fd',
    muted: '#5f8497',
    accent: '#0a74da',
    accent2: '#00c9b7', // aqua front line and headline shadow
    line: '#b9e3f7',
  },
  {
    ...uv,
    id: 'forest',
    name: 'Forest',
    panel: '#edf8f1',
    fg: '#0b1f14',
    plate: '#edf8f1',
    muted: '#5f8a70',
    accent: '#12a05c',
    accent2: '#ff3d81', // pink front line and headline shadow
    line: '#b8e6c9',
  },
];

export const screenThemes = themes.filter((t) => !t.print);
export const printThemes = themes.filter((t) => t.print);
