const fs = require('fs');
const path = require('path');
const B = __dirname;
const rd = f => fs.readFileSync(path.join(B, f), 'utf8');
const L = require('./lib-final.js');
const t = L.textBlock(1);
const sw = L.symWidth(t.blockH), gap = t.blockH * 0.34;
const lockGap = sw + gap;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#fff;padding:24px;font-family:"Segoe UI",Arial}
.tag{font-size:12px;letter-spacing:.16em;color:#9494a8;text-transform:uppercase;margin-bottom:8px}
.row{margin-bottom:30px;position:relative}
.box{position:relative}
.box>svg:first-of-type{width:100%;height:auto;display:block}
.g{position:absolute;top:-14px;bottom:-14px;width:1px;background:#FF2D2D}
</style></head><body>

<div class="row"><div class="tag">wordmark — red at content x=0 (both lines must touch it)</div>
<div class="box" style="width:1200px">${rd('hima-wordmark.svg')}
<div class="g" style="left:${(1200 * (t.blockH * 0.05) / (t.w + t.blockH * 0.1)).toFixed(2)}px"></div></div></div>

<div class="row"><div class="tag">horizontal lockup — red at content x=0</div>
<div class="box" style="width:1400px">${rd('hima-logo.svg')}
<div class="g" style="left:${(1400 * (t.blockH * 0.05) / (lockGap + t.w + t.blockH * 0.1)).toFixed(2)}px"></div>
<div class="g" style="left:${(1400 * (lockGap + t.blockH * 0.05) / (lockGap + t.w + t.blockH * 0.1)).toFixed(2)}px;background:#2D7BFF"></div></div></div>

<div class="row"><div class="tag">arabic only — red at content x=0</div>
<div class="box" style="width:900px">${rd('hima-logo-arabic.svg')}
<div class="g" style="left:${(900 * (t.arab.above + t.arab.below) * 0.06 / (sw + gap + t.arab.w + (t.arab.above + t.arab.below) * 0.12)).toFixed(2)}px"></div></div></div>

<div class="row"><div class="tag">stacked</div>
<div class="box" style="width:460px">${rd('hima-logo-stacked.svg')}</div></div>

</body></html>`;
fs.writeFileSync(path.join(B, 'aligncheck.html'), html);
console.log('ok', {himaX: t.hima.x, arabX: t.arab.x, himaW: t.hima.w, arabW: t.arab.w, w: t.w, blockH: t.blockH, lockGap});
