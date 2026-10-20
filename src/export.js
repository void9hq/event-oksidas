export function svgString(el) {
  // drop Svelte's empty anchor comments
  const s = new XMLSerializer().serializeToString(el).replace(/<!---->/g, '');
  return `<?xml version="1.0" encoding="UTF-8"?>\n${s}\n`;
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function saveSvg(el, name) {
  download(new Blob([svgString(el)], { type: 'image/svg+xml' }), `${name}.svg`);
}

// Rasterize the SVG element at w x h px. Also used by scripts/export.mjs (headless).
export async function pngBlob(el, w, h) {
  const url = URL.createObjectURL(new Blob([svgString(el)], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    // embedded fonts can land a tick after decode
    await new Promise((r) => setTimeout(r, 150));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return await new Promise((r) => c.toBlob(r, 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function savePng(el, w, h, name) {
  download(await pngBlob(el, w, h), `${name}.png`);
}

// base64 PNG without the data: prefix, for handing back to a Node script
export async function pngBase64(el, w, h) {
  const blob = await pngBlob(el, w, h);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
