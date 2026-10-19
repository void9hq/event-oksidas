// Themes are plain data. Add one by copying an entry.
//   panel   — placeholder fill
//   line    — rules, dashed frames, grid dots
//   plate   — light backing behind partner logos (logos keep their own colours)
//   grid    — dot grid opacity (0 = off)
//   wave    — oscilloscope band: line count, fold = how "oxidized" the last trace gets, opacity
//   shadow  — opacity of the offset headline copy in accent2 (0 = off)
//   fonts   — keys from fonts.js
const base = {
  fonts: { head: 'victor', body: 'plex' },
  grid: 0.5,
  wave: { lines: 12, fold: 1, opacity: 0.9 },
  shadow: 1,
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
];
