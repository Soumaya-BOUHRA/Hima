const fs = require('fs');
const path = require('path');
const { textPath, BRAND } = require('C:\\Users\\pc\\AppData\\Local\\Temp\\opencode\\fonttools\\lib.js');

// ---------------------------------------------------------------- palette
const P = '#7E80D8', M = '#CD49AA', T = '#67CECB';
const INK = '#17172B';
const WHITE = '#FFFFFF';
const AR = '\u0647\u0650\u0645\u0651\u0629';

const r = v => Math.round(v * 1000) / 1000;

// ---------------------------------------------------------------- symbol
const SYM = {
  vb: [16, 14, 88, 92],
  body: c => `<path d="M44 80 L76 68" stroke="${c.a}" stroke-width="20" stroke-linecap="round"/>`
    + `<rect x="16" y="30" width="22" height="76" rx="11" fill="${c.l}"/>`
    + `<rect x="82" y="14" width="22" height="92" rx="11" fill="${c.r}"/>`,
  full: () => SYM.body({ a: M, l: P, r: T }),
  solid: col => SYM.body({ a: col, l: col, r: col })
};

/** nested <svg> of the mark, height h, at x,y */
function symSvg(x, y, h, mode) {
  const [, , w, hh] = SYM.vb;
  const sw = h * w / hh;
  const inner = mode === 'full' ? SYM.full() : SYM.solid(mode);
  return `<svg x="${r(x)}" y="${r(y)}" width="${r(sw)}" height="${r(h)}" `
    + `viewBox="${SYM.vb.join(' ')}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
function symWidth(h) { const [, , w, hh] = SYM.vb; return h * w / hh; }

// ---------------------------------------------------------------- text
function textBlock(scale) {
  const LS = 72 * scale, AS = 60 * scale, TGAP = 14 * scale;
  const hima = textPath('Poppins-SemiBold.ttf', 'HIMA', LS, 0.05);
  const arab = textPath('Tajawal-Bold.ttf', AR, AS, 0);
  const blockH = hima.above + TGAP + arab.above + arab.below;
  const arabBaseY = TGAP + arab.above;
  return { hima, arab, blockH, arabBaseY, w: Math.max(hima.w, arab.w), hAbove: hima.above };
}

/** nested <svg> of the two-line wordmark (HIMA over هِمّة) */
function textSvg(x, y, t, ink, opt) {
  opt = opt || {};
  const showH = opt.hima !== false, showA = opt.arab !== false;
  const w = opt.w != null ? opt.w : t.w;
  const h = opt.h != null ? opt.h : t.blockH;
  const y0 = opt.y0 != null ? opt.y0 : -t.hAbove;
  let inner = '';
  if (showH) {
    const tx = opt.center ? (w - t.hima.w) / 2 - t.hima.x : -t.hima.x;
    inner += `<g transform="translate(${r(tx)} 0)"><path d="${t.hima.d}" fill="${ink}"/></g>`;
  }
  if (showA) {
    const tx = opt.center ? (w - t.arab.w) / 2 - t.arab.x : -t.arab.x;
    inner += `<g transform="translate(${r(tx)} ${r(t.arabBaseY)})"><path d="${t.arab.d}" fill="${ink}"/></g>`;
  }
  return `<svg x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" `
    + `viewBox="0 ${r(y0)} ${r(w)} ${r(h)}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

/** standalone (root) svg with optional padding */
function rootSvg(W, H, body, pad) {
  pad = pad == null ? 0 : pad;
  const vb = `${-pad} ${-pad} ${r(W + pad * 2)} ${r(H + pad * 2)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${r(W + pad * 2)}" height="${r(H + pad * 2)}" `
    + `viewBox="${vb}">${body}</svg>\n`;
}

// ---------------------------------------------------------------- lockups
function horizontal(t, ink, sym, gapScale) {
  const sh = t.blockH;
  const sw = symWidth(sh);
  const gap = sh * (gapScale == null ? 0.34 : gapScale);
  const W = sw + gap + t.w, H = t.blockH;
  return {
    W, H,
    body: symSvg(0, 0, sh, sym) + textSvg(sw + gap, 0, t, ink)
  };
}

function stacked(t, ink, sym) {
  const sh = t.blockH * 0.78;
  const sw = symWidth(sh);
  const gap = sh * 0.30;
  const W = Math.max(sw, t.w), H = sh + gap + t.blockH;
  const sx = (W - sw) / 2;
  const tx = (W - t.w) / 2;
  return { W, H, body: symSvg(sx, 0, sh, sym) + textSvg(tx, sh + gap, t, ink) };
}

function englishOnly(t, ink, sym) {
  const sh = t.hAbove * 1.0;
  const sw = symWidth(sh);
  const gap = sh * 0.34;
  const w = t.hima.w, h = t.hAbove;
  const W = sw + gap + w, H = h;
  return {
    W, H,
    body: symSvg(0, 0, sh, sym)
      + `<g transform="translate(${r(sw + gap)} 0)">`
      + `<svg x="0" y="0" width="${r(w)}" height="${r(h)}" viewBox="0 ${r(-h)} ${r(w)} ${r(h)}">`
      + `<g transform="translate(${r(-t.hima.x)} 0)"><path d="${t.hima.d}" fill="${ink}"/></g></svg></g>`
  };
}

function arabicOnly(t, ink, sym) {
  const w = t.arab.w;
  const h = t.arab.above + t.arab.below;
  const sh = h;
  const sw = symWidth(sh);
  const gap = sh * 0.34;
  const W = sw + gap + w, H = h;
  return {
    W, H,
    body: symSvg(0, 0, sh, sym)
      + `<g transform="translate(${r(sw + gap)} 0)">`
      + `<svg x="0" y="0" width="${r(w)}" height="${r(h)}" viewBox="0 0 ${r(w)} ${r(h)}">`
      + `<g transform="translate(${r(-t.arab.x)} ${r(t.arab.above)})"><path d="${t.arab.d}" fill="${ink}"/></g></svg></g>`
  };
}

// ---------------------------------------------------------------- app icon
function appIcon(size, flat) {
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  const bg = flat
    ? `<rect width="120" height="120" rx="30" fill="${P}"/>`
    : `<rect width="120" height="120" rx="30" fill="url(#${gid})"/>`;
  const defs = flat ? '' : `<defs><linearGradient id="${gid}" x1="0" y1="120" x2="120" y2="0" gradientUnits="userSpaceOnUse">`
    + `<stop offset="0" stop-color="${P}"/><stop offset="0.52" stop-color="${M}"/><stop offset="1" stop-color="${T}"/>`
    + `</linearGradient></defs>`;
  const [x, y, w, hh] = SYM.vb;
  const target = 74;
  const sc = target / Math.max(w, hh);
  const tx = 60 - (w * sc) / 2 - x * sc;
  const ty = 60 - (hh * sc) / 2 - y * sc;
  const inner = SYM.solid(WHITE);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">`
    + defs + bg
    + `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(sc)})">${inner}</g></svg>\n`;
}

// ---------------------------------------------------------------- output
function write(file, content) {
  fs.writeFileSync(path.join(BRAND, file), content, 'utf8');
  console.log('  ' + file);
}

module.exports = {
  BRAND, P, M, T, INK, WHITE, AR, SYM, r,
  symSvg, symWidth, textBlock, textSvg, rootSvg,
  horizontal, stacked, englishOnly, arabicOnly, appIcon, write
};

if (require.main === module) {
  console.log('lib-final ok');
  const t = textBlock(1);
  console.log('blockH', t.blockH.toFixed(1), 'w', t.w.toFixed(1));
}
