const fs = require('fs');
const path = require('path');
const L = require('./lib-final.js');
const { BRAND, textBlock, rootSvg, horizontal, stacked, englishOnly, arabicOnly,
  appIcon, write, P, M, T, INK, WHITE, symSvg, symWidth, textSvg, r, SYM } = L;

console.log('building HIMA logo system…');
const t = textBlock(1);

// 1. primary horizontal, light background
{
  const k = horizontal(t, INK, 'full');
  write('hima-logo.svg', rootSvg(k.W, k.H, k.body, k.H * 0.05));
}
// 2. primary horizontal, dark background (transparent)
{
  const k = horizontal(t, WHITE, 'full');
  write('hima-logo-dark.svg', rootSvg(k.W, k.H, k.body, k.H * 0.05));
}
// 3. stacked / vertical
{
  const k = stacked(t, INK, 'full');
  write('hima-logo-stacked.svg', rootSvg(k.W, k.H, k.body, k.H * 0.05));
}
// 4. english focused
{
  const k = englishOnly(t, INK, 'full');
  write('hima-logo-english.svg', rootSvg(k.W, k.H, k.body, k.H * 0.06));
}
// 5. arabic focused
{
  const k = arabicOnly(t, INK, 'full');
  write('hima-logo-arabic.svg', rootSvg(k.W, k.H, k.body, k.H * 0.06));
}
// 6. wordmark only
{
  const pad = t.blockH * 0.05;
  const body = textSvg(0, 0, t, INK);
  write('hima-wordmark.svg', rootSvg(t.w, t.blockH, body, pad));
}
// 7. symbol only — colour
{
  const h = 96;
  const w = symWidth(h);
  write('hima-icon.svg', rootSvg(w, h, symSvg(0, 0, h, 'full'), 0));
}
// 8. symbol only — monochrome
{
  const h = 96;
  const w = symWidth(h);
  write('hima-icon-mono.svg', rootSvg(w, h, symSvg(0, 0, h, INK), 0));
  write('hima-icon-white.svg', rootSvg(w, h, symSvg(0, 0, h, WHITE), 0));
}
// 9. monochrome lockups
{
  const k = horizontal(t, INK, INK);
  write('hima-logo-mono-black.svg', rootSvg(k.W, k.H, k.body, k.H * 0.05));
  const k2 = horizontal(t, WHITE, WHITE);
  write('hima-logo-mono-white.svg', rootSvg(k2.W, k2.H, k2.body, k2.H * 0.05));
}
// 10. app icons
write('hima-app-icon.svg', appIcon(1024, false));
write('hima-app-icon-flat.svg', appIcon(1024, true));
write('hima-favicon.svg', appIcon(64, false));

// ---------------------------------------------------------------- brand sheet
const files = [
  ['hima-logo.svg', 'Primary — horizontal lockup'],
  ['hima-logo-dark.svg', 'Primary — dark background', 1],
  ['hima-logo-stacked.svg', 'Stacked / vertical'],
  ['hima-logo-english.svg', 'English only'],
  ['hima-logo-arabic.svg', 'Arabic only'],
  ['hima-wordmark.svg', 'Wordmark only'],
  ['hima-icon.svg', 'Symbol — colour'],
  ['hima-icon-mono.svg', 'Symbol — monochrome'],
  ['hima-icon-white.svg', 'Symbol — white', 1],
  ['hima-logo-mono-black.svg', 'Lockup — monochrome black'],
  ['hima-logo-mono-white.svg', 'Lockup — monochrome white', 1],
  ['hima-app-icon.svg', 'App icon — gradient'],
  ['hima-app-icon-flat.svg', 'App icon — flat'],
  ['hima-favicon.svg', 'Favicon']
];

const card = (file, label, dark) => `<div class="card${dark ? ' onDark' : ''}"><div class="art">${fs.readFileSync(path.join(BRAND, file), 'utf8')}</div><div class="lbl">${label}<span>${file}</span></div></div>`;

const sheet = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>HIMA — Brand Identity</title>
<style>
@font-face{font-family:Poppins;src:url(fonts/Poppins-SemiBold.ttf) format('truetype');font-weight:600}
@font-face{font-family:Tajawal;src:url(fonts/Tajawal-Bold.ttf) format('truetype');font-weight:700}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1480px;background:#fff;font-family:"Segoe UI",Arial,sans-serif;color:${INK};padding:44px 46px}
h1{font-size:34px;letter-spacing:.22em;font-family:Poppins;font-weight:600}
.sub{font-family:Tajawal;font-size:26px;color:${M};margin-top:4px}
p.t{font-size:13px;color:#6d6d80;margin-top:8px;letter-spacing:.03em}
.hero{margin:30px 0 12px;padding:46px 40px;border-radius:22px;background:#F6F6FB;
      display:flex;justify-content:center;align-items:center}
.hero svg{width:760px;height:auto}
h2{font-size:12px;letter-spacing:.2em;color:#9494a8;margin:34px 0 14px;text-transform:uppercase}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.card{border:1px solid #e9e9f2;border-radius:16px;overflow:hidden;background:#fff}
.art{height:170px;display:flex;align-items:center;justify-content:center;padding:22px;background:#fff}
.art svg{max-width:100%;max-height:126px;width:auto;height:auto}
.card:nth-child(2n) .art{background:#FAFAFD}
.lbl{font-size:11.5px;padding:9px 12px 11px;border-top:1px solid #f0f0f6;color:#3d3d52}
.lbl span{display:block;color:#9a9ab0;font-size:10px;margin-top:2px}
.dark .art{background:#12121C}
.dark .lbl{border-top-color:#20202f;color:#c9c9dd}
.dark .lbl span{color:#6a6a85}
.onDark .art,.darkstrip .art{background:#12121C !important}
.darkstrip .lbl{border-top-color:#20202f !important;color:#c9c9dd !important}
.darkstrip .lbl span{color:#6a6a85 !important}
.darkstrip{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.darkstrip .card{background:#12121C;border-color:#12121C}
.sw{display:flex;gap:12px}
.sw div{flex:1;border-radius:12px;padding:14px;height:96px;color:#fff;font-size:12px;display:flex;
        flex-direction:column;justify-content:flex-end}
.sw b{font-size:15px;letter-spacing:.04em}
.sizes{display:flex;align-items:flex-end;gap:26px;padding:26px 30px;background:#F6F6FB;border-radius:16px}
.sizes div{text-align:center;font-size:10px;color:#8b8ba0}
.sizes span{display:block}
.sizes svg{width:100%;height:auto;display:block}
.art span svg{width:100%;height:auto;display:block}
.tag{font-size:14.5px;color:#4a4a63;margin-top:6px;letter-spacing:.01em}
.tagar{font-family:Tajawal;font-size:17px;color:#4a4a63;margin-top:4px}
</style></head><body>

<h1>HIMA</h1>
<div class="sub">هِمّة</div>
<p class="t">Productivity &amp; task management — identity system</p>
<div class="tag">نظّم مهامك، رتّب أولوياتك، وخلي خدمتك تمشي بسلاسة.</div>
<div class="tagar">كل مهمة كتقرّبك من الهدف ديالك.</div>

<div class="hero">${fs.readFileSync(path.join(BRAND, 'hima-logo.svg'), 'utf8')}</div>

<h2>Colour</h2>
<div class="sw">
  <div style="background:${P}"><b>Primary Purple</b>#7E80D8</div>
  <div style="background:${M}"><b>Magenta</b>#CD49AA</div>
  <div style="background:${T};color:#0d3b39"><b>Turquoise</b>#67CECB</div>
  <div style="background:linear-gradient(135deg,${P} 0%,${M} 52%,${T} 100%)"><b>Brand Gradient</b>P → M → T</div>
  <div style="background:${INK}"><b>Ink</b>#17172B</div>
</div>

<h2>Logo system</h2>
<div class="grid">${files.slice(0, 8).map(([f, l, d]) => card(f, l, d)).join('')}</div>

<h2>Monochrome &amp; app</h2>
<div class="grid">${files.slice(8).map(([f, l, d]) => card(f, l, d)).join('')}</div>

<h2>On dark</h2>
<div class="darkstrip">
  <div class="card dark"><div class="art">${fs.readFileSync(path.join(BRAND, 'hima-logo-dark.svg'), 'utf8')}</div><div class="lbl">Reversed lockup<span>hima-logo-dark.svg</span></div></div>
  <div class="card dark"><div class="art">${fs.readFileSync(path.join(BRAND, 'hima-logo-mono-white.svg'), 'utf8')}</div><div class="lbl">Reversed monochrome<span>hima-logo-mono-white.svg</span></div></div>
  <div class="card dark"><div class="art">${fs.readFileSync(path.join(BRAND, 'hima-icon-white.svg'), 'utf8')}</div><div class="lbl">Reversed symbol<span>hima-icon-white.svg</span></div></div>
</div>

<h2>Small sizes</h2>
<div class="sizes">
  ${[340, 240, 160, 110].map(w => `<div><span style="display:block;width:${w}px">${fs.readFileSync(path.join(BRAND, 'hima-logo.svg'), 'utf8')}</span><br>${w}px</div>`).join('')}
</div>

<h2>App icon</h2>
<div class="grid">
  <div class="card"><div class="art">${fs.readFileSync(path.join(BRAND, 'hima-app-icon.svg'), 'utf8')}</div><div class="lbl">iOS / Android — 1024<span>hima-app-icon.svg</span></div></div>
  <div class="card"><div class="art">${fs.readFileSync(path.join(BRAND, 'hima-app-icon-flat.svg'), 'utf8')}</div><div class="lbl">Flat — monochrome tile<span>hima-app-icon-flat.svg</span></div></div>
  <div class="card"><div class="art" style="gap:14px">
     ${[72, 48, 32, 16].map(s => `<span style="display:block;width:${s}px;height:${s}px">${fs.readFileSync(path.join(BRAND, 'hima-app-icon.svg'), 'utf8')}</span>`).join('')}
   </div><div class="lbl">72 / 48 / 32 / 16 px<span>favicon scale test</span></div></div>
  <div class="card"><div class="art" style="gap:16px">
     ${[48, 32, 24, 16].map(s => `<span style="display:block;width:${Math.round(s * 88 / 92)}px;height:${s}px">${fs.readFileSync(path.join(BRAND, 'hima-icon.svg'), 'utf8')}</span>`).join('')}
   </div><div class="lbl">Symbol — 48 / 32 / 24 / 16 px<span>UI size test</span></div></div>
</div>

</body></html>`;

write('brand-sheet.html', sheet);
console.log('done');
