// Fonts are embedded as data URIs so exported SVG/PNG render the same anywhere.
// Text fonts: latin + latin-ext subsets (covers Lithuanian ąčęėįšųūž).
// Wordmark fonts (partner names without a logo): latin only, ext is optional.
import vm700 from '@fontsource/victor-mono/files/victor-mono-latin-700-normal.woff2?inline';
import vm700x from '@fontsource/victor-mono/files/victor-mono-latin-ext-700-normal.woff2?inline';
import px400 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2?inline';
import px400x from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-ext-400-normal.woff2?inline';
import px600 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2?inline';
import px600x from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-ext-600-normal.woff2?inline';
import mi400 from '@fontsource/michroma/files/michroma-latin-400-normal.woff2?inline';
import ub800 from '@fontsource/unbounded/files/unbounded-latin-800-normal.woff2?inline';

const RANGE_LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const RANGE_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

// family: prefixed so a locally installed copy can't shadow the embedded one (SVG/canvas).
// web: family name the site gets from the @fontsource CSS imports in site/main.js.
export const FONTS = {
  victor: {
    family: 'OxVictorMono',
    web: 'Victor Mono',
    fallback: 'monospace',
    faces: [{ weight: 700, latin: vm700, ext: vm700x }],
  },
  plex: {
    family: 'OxPlexSans',
    web: 'IBM Plex Sans',
    fallback: 'sans-serif',
    faces: [
      { weight: 400, latin: px400, ext: px400x },
      { weight: 600, latin: px600, ext: px600x },
    ],
  },
  michroma: {
    family: 'OxMichroma',
    web: 'Michroma',
    fallback: 'sans-serif',
    faces: [{ weight: 400, latin: mi400 }],
  },
  unbounded: {
    family: 'OxUnbounded',
    web: 'Unbounded',
    fallback: 'sans-serif',
    faces: [{ weight: 800, latin: ub800 }],
  },
};

const subsets = (w) => [[w.latin, RANGE_LATIN], ...(w.ext ? [[w.ext, RANGE_EXT]] : [])];

// Same faces registered with the document, so canvas text measurement uses the real metrics.
export const fontsReady = Promise.all(
  Object.values(FONTS).flatMap((f) =>
    f.faces.flatMap((w) =>
      subsets(w).map(([src, unicodeRange]) => {
        const ff = new FontFace(f.family, `url(${src})`, { weight: String(w.weight), unicodeRange });
        document.fonts.add(ff);
        return ff.load();
      }),
    ),
  ),
);

let ctx;
// width in px of text at font-size 1
export function measure(text, id, weight, letterSpacingEm = 0) {
  ctx ??= document.createElement('canvas').getContext('2d');
  ctx.font = `${weight} 100px ${stack(id)}`;
  return ctx.measureText(text).width / 100 + letterSpacingEm * text.length;
}

export const stack = (id) => `'${FONTS[id].family}', ${FONTS[id].fallback}`;
export const webStack = (id) => `'${FONTS[id].web}', ${FONTS[id].fallback}`;

export function fontCss(ids) {
  const face = (family, weight, src, range) =>
    `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;` +
    `src:url(${src}) format('woff2');unicode-range:${range};}`;
  return [...new Set(ids)]
    .flatMap((id) => {
      const f = FONTS[id];
      return f.faces.flatMap((w) => subsets(w).map(([src, range]) => face(f.family, w.weight, src, range)));
    })
    .join('\n');
}
