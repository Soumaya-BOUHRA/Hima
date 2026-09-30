const fs = require('fs');
const path = require('path');
const B = __dirname;
const rd = f => fs.readFileSync(path.join(B, f), 'utf8');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#fff;padding:30px;font-family:"Segoe UI",Arial,sans-serif;color:#17172B}
.row{margin-bottom:24px}
.tag{font-size:11px;letter-spacing:.18em;color:#9494a8;text-transform:uppercase;margin-bottom:8px}
.chips{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
.chip{border:1px solid #e9e9f2;border-radius:14px;padding:18px}
.box>svg{width:100%!important;height:auto!important;display:block}
svg{display:block}
</style></head><body>

<div class="row"><div class="tag">hima-logo-arabic.svg — 900px</div>
<div class="box" style="width:900px">${rd('hima-logo-arabic.svg')}</div></div>

<div class="row"><div class="tag">hima-logo-arabic.svg — 420 / 300 / 200 / 140 px</div>
<div class="chips">
${[420,300,200,140].map(w=>`  <div class="chip box" style="width:${w}px">${rd('hima-logo-arabic.svg')}</div>`).join('\n')}
</div></div>

<div class="row"><div class="tag">hima-wordmark.svg — 600px</div>
<div class="box" style="width:600px">${rd('hima-wordmark.svg')}</div></div>

<div class="row"><div class="tag">hima-logo.svg — 900px</div>
<div class="box" style="width:900px">${rd('hima-logo.svg')}</div></div>

<div class="row"><div class="tag">hima-logo-stacked.svg — 340px</div>
<div class="box" style="width:340px">${rd('hima-logo-stacked.svg')}</div></div>

</body></html>`;

fs.writeFileSync(path.join(B, 'arabcheck.html'), html);
console.log('ok', html.length);
