const fs = require('fs');
const path = require('path');
const { textPath, BRAND } = require('C:\\Users\\pc\\AppData\\Local\\Temp\\opencode\\fonttools\\lib.js');

const P = '#7E80D8', M = '#CD49AA', T = '#67CECB';
const INK = '#17172B';

const CANDIDATES = [
  { id: 'A', name: 'Ascent H', vb: [16, 14, 88, 92], body: `
      <path d="M44 80 L76 68" stroke="${M}" stroke-width="20" stroke-linecap="round"/>
      <rect x="16" y="30" width="22" height="76" rx="11" fill="${P}"/>
      <rect x="82" y="14" width="22" height="92" rx="11" fill="${T}"/>` },

  { id: 'B', name: 'Trajectory', vb: [13, 8, 97, 97], body: `
      <path d="M24 94 A70 70 0 0 1 94 24" stroke="url(#%G%)" stroke-width="15" stroke-linecap="round"/>
      <circle cx="24" cy="94" r="11" fill="${P}"/>
      <circle cx="94" cy="24" r="16" fill="${T}"/>` },

  { id: 'C', name: 'Task Path', vb: [12, 22, 95, 77], body: `
      <path d="M36 87 L58 87 L88 43" stroke="url(#%G%)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="24" cy="87" r="12" fill="${P}"/>
      <circle cx="90" cy="39" r="17" fill="${T}"/>` },

  { id: 'D', name: 'Steps', vb: [8.5, 20, 104.5, 83.5], body: `
      <path d="M16 96 L44 96 L44 80" stroke="${P}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M44 80 L44 64 L72 64 L72 48" stroke="${M}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M72 48 L72 32 L96 32" stroke="${T}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="101" cy="32" r="12" fill="${T}"/>` },

  { id: 'E', name: 'Chevron Rise', vb: [29.5, 18.5, 61, 83], body: `
      <g stroke-linecap="round" stroke-linejoin="round" stroke-width="13" fill="none">
        <path d="M44 95 L60 79 L76 95" stroke="${P}"/>
        <path d="M40 73 L60 53 L80 73" stroke="${M}"/>
        <path d="M36 49 L60 25 L84 49" stroke="${T}"/>
      </g>` },

  { id: 'F', name: 'Task Nodes', vb: [16, 9, 95, 93], body: `
      <path d="M24 94 L58 62 L94 26" stroke="url(#%G%)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="24" cy="94" r="8" fill="${P}"/>
      <circle cx="58" cy="62" r="12" fill="${M}"/>
      <circle cx="94" cy="26" r="17" fill="${T}"/>` }
];

const AR = '\u0647\u0650\u0645\u0651\u0629';

// ---- text + lockup construction ---------------------------------------
function textBlock(scale) {
  const LS = 72 * scale, AS = 60 * scale, TGAP = 14 * scale;
  const hima = textPath('Poppins-SemiBold.ttf', 'HIMA', LS, 0.05);
  const arab = textPath('Tajawal-Bold.ttf', AR, AS, 0);
  const blockH = hima.above + TGAP + arab.above + arab.below;
  const arabBaseY = hima.above + TGAP + arab.above;
  const w = Math.max(hima.w, arab.w);
  return { LS, AS, hima, arab, blockH, arabBaseY, w, hAbove: hima.above };
}

const FULL = textBlock(1);

let gradN = 0;
function symbolSVG(c, h, solid) {
  const [x, y, w, hh] = c.vb;
  const sw = h * w / hh;
  let inner = c.body, defs = '';
  if (solid) {
    inner = inner.replace(/fill="(?!none)[^"]*"/g, `fill="${solid}"`)
      .replace(/stroke="url\(#%G%\)"/g, `stroke="${solid}"`)
      .replace(/stroke="(#[0-9A-Fa-f]{6})"/g, `stroke="${solid}"`);
  } else if (c.body.includes('%G%')) {
    const gid = 'LG' + (gradN++);
    inner = inner.replace(/url\(#%G%\)/g, `url(#${gid})`);
    defs = `<defs><linearGradient id="${gid}" x1="0" y1="120" x2="120" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${P}"/><stop offset="0.52" stop-color="${M}"/><stop offset="1" stop-color="${T}"/></linearGradient></defs>`;
  }
  return `<svg width="${sw.toFixed(1)}" height="${h.toFixed(1)}" viewBox="${x} ${y} ${w} ${hh}" fill="none" xmlns="http://www.w3.org/2000/svg">${defs}${inner}</svg>`;
}

function lockup(c, scale, ink, solid) {
  const t = textBlock(scale);
  const sym = symbolSVG(c, t.blockH, solid);
  const gap = t.blockH * 0.34;
  const txt = `<svg width="${t.w.toFixed(1)}" height="${t.blockH.toFixed(1)}" viewBox="0 ${(-t.hAbove).toFixed(1)} ${t.w.toFixed(1)} ${t.blockH.toFixed(1)}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(${(-t.hima.x).toFixed(2)} 0)"><path d="${t.hima.d}" fill="${ink}"/></g>
      <g transform="translate(${(-t.arab.x).toFixed(2)} ${t.arabBaseY.toFixed(2)})"><path d="${t.arab.d}" fill="${ink}"/></g>
    </svg>`;
  return `<span class="lock" style="display:inline-flex;align-items:center;gap:${gap.toFixed(1)}px">${sym}${txt}</span>`;
}

function appIcon(c, size, flat) {
  const gid = 'IG' + (gradN++);
  const bg = flat ? `<rect width="120" height="120" rx="30" fill="${P}"/>`
    : `<rect width="120" height="120" rx="30" fill="url(#${gid})"/>`;
  const [x, y, w, hh] = c.vb;
  const target = 72;
  const sc = target / Math.max(w, hh);
  const tx = 60 - (w * sc) / 2 - x * sc;
  const ty = 60 - (hh * sc) / 2 - y * sc;
  const inner = c.body
    .replace(/fill="(?!none)[^"]*"/g, 'fill="#FFFFFF"')
    .replace(/stroke="url\(#%G%\)"/g, 'stroke="#FFFFFF"')
    .replace(/stroke="(#[0-9A-Fa-f]{6})"/g, 'stroke="#FFFFFF"');
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${gid}" x1="0" y1="120" x2="120" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${P}"/><stop offset="0.52" stop-color="${M}"/><stop offset="1" stop-color="${T}"/></linearGradient></defs>
    ${bg}<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${sc.toFixed(4)})">${inner}</g></svg>`;
}

const rows = CANDIDATES.map(c => `
  <div class="row">
    <div class="col lbl"><div class="cid">${c.id}</div><div class="cname">${c.name}</div></div>
    <div class="col">${lockup(c, 1, INK, null)}<div class="cap">primary lockup &middot; light</div></div>
    <div class="col dk">${lockup(c, 1, '#FFFFFF', null)}<div class="cap">dark background</div></div>
    <div class="col">${appIcon(c, 104, false)} ${appIcon(c, 52, false)} ${appIcon(c, 34, true)}<div class="cap">app icon / flat</div></div>
    <div class="col ramp">
      ${lockup(c, 0.5, INK, null)}
      <div style="height:6px"></div>
      ${lockup(c, 0.3, INK, null)}
      <div style="height:6px"></div>
      <span style="display:inline-flex;gap:8px;align-items:flex-end">${symbolSVG(c, 32)}${symbolSVG(c, 16)}</span>
      <div class="cap">50% / 30% &middot; icon 32 / 16</div></div>
    <div class="col mono">
      <div class="chip">${lockup(c, 0.5, INK, INK)}</div>
      <div class="chip dkchip">${lockup(c, 0.5, '#FFFFFF', '#FFFFFF')}</div>
      <div class="cap">monochrome</div></div>
  </div>`).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1800px;overflow:hidden}
body{background:#fff;font-family:Segoe UI,Arial,sans-serif;padding:20px 22px;color:#111}
h1{font-size:18px;letter-spacing:.06em}
p.s{font-size:12.5px;color:#6b6b7b;margin:3px 0 14px}
.row{display:grid;grid-template-columns:74px 432px 424px 236px 214px 316px;gap:12px;align-items:center;
     border:1px solid #e8e8f0;border-radius:14px;padding:16px;margin-bottom:14px}
.lbl{text-align:center}
.cid{font-size:30px;font-weight:800;color:${P}}
.cname{font-size:10.5px;color:#666;margin-top:2px}
.cap{font-size:10px;color:#8a8a99;margin-top:8px;text-align:center}
.col{text-align:center;overflow:hidden}
.dk{background:#12121c;border-radius:10px;padding:16px 12px}
.dk .cap{color:#8888a0}
.ramp .lock{margin:0 auto}
.chip{border-radius:9px;padding:14px 8px;background:#fff;border:1px solid #ececf3;margin-bottom:8px}
.dkchip{background:#12121c;border-color:#12121c}
</style></head><body>
<h1>HIMA &mdash; Finalist Comparison</h1>
<p class="s">Outlined Poppins SemiBold (HIMA) + Tajawal Bold (هِمّة)</p>
${rows}
</body></html>`;

fs.writeFileSync(path.join(BRAND, 'compare.html'), html);
console.log('wrote compare.html  blockH=' + FULL.blockH.toFixed(1) + '  himaW=' + FULL.hima.w.toFixed(1) + '  arabW=' + FULL.arab.w.toFixed(1));
