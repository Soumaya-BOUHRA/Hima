const fs = require('fs');
const path = require('path');

const sub = process.argv[2] || 'concepts';
const title = process.argv[3] || 'HIMA &mdash; Concept Exploration';
const dir = path.join(__dirname, sub);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg')).sort();

const cards = files.map(f => {
  const svg = fs.readFileSync(path.join(dir, f), 'utf8').trim();
  const name = f.replace('.svg', '');
  return `<div class="card">
    <div class="big">${svg}</div>
    <div class="ramp">
      <span class="s64">${svg}</span>
      <span class="s32">${svg}</span>
      <span class="s16">${svg}</span>
      <span class="s12">${svg}</span>
    </div>
    <div class="dark">${svg}</div>
    <div class="label">${name}</div>
  </div>`;
}).join('\n');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:740px;overflow:hidden}
body{background:#fff;font-family:Segoe UI,Arial,sans-serif;padding:20px 24px;color:#111}
h1{font-size:19px;font-weight:700;letter-spacing:.06em}
p.sub{font-size:12.5px;color:#6b6b7b;margin:3px 0 14px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:14px;height:648px}
.card{border:1px solid #e6e6ee;border-radius:14px;padding:12px;background:#fff;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.big{height:146px;display:flex;align-items:center}
.big svg{width:140px;height:140px;display:block}
.ramp{display:flex;align-items:flex-end;gap:10px;height:60px;justify-content:flex-end}
.ramp svg{display:block}
.s64 svg{width:52px;height:52px}
.s32 svg{width:32px;height:32px}
.s16 svg{width:16px;height:16px}
.s12 svg{width:12px;height:12px}
.dark{background:#11111b;border-radius:10px;padding:7px;display:flex;justify-content:center;margin-top:6px}
.dark svg{width:46px;height:46px}
.label{font-size:11.5px;font-weight:600;letter-spacing:.03em;color:#333;text-align:center;margin-top:6px}
</style></head><body>
<h1>${title}</h1>
<p class="sub">8 original directions &middot; 140 / 52 / 32 / 16 / 12 px + dark background</p>
<div class="grid">${cards}</div>
</body></html>`;

fs.writeFileSync(path.join(__dirname, sub + '.html'), html);
console.log('wrote ' + sub + '.html with', files.length, 'concepts');
