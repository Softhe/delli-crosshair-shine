import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const artifactDir = resolve('artifacts/preview-calibration');
const manifest = JSON.parse(await readFile(resolve('docs/preview-reference-matrix.json'), 'utf8'));
await mkdir(artifactDir, { recursive: true });

const exists = async (path) => access(path).then(() => true).catch(() => false);
const rows = [];
let completePairs = 0;

for (const resolution of manifest.resolutions) {
  for (const scenario of manifest.scenarios) {
    const stem = `${scenario.id}-${resolution.id}`;
    const browserFile = `${stem}-browser.png`;
    const cs2File = `${stem}-cs2.png`;
    const browserExists = await exists(resolve(artifactDir, browserFile));
    const cs2Exists = await exists(resolve(artifactDir, cs2File));
    if (browserExists && cs2Exists) completePairs += 1;
    rows.push({ scenario, resolution, browserFile, cs2File, browserExists, cs2Exists });
  }
}

const image = (file, present, label) => present
  ? `<img src="${file}" alt="${label}" loading="lazy">`
  : `<div class="missing">Missing ${label}</div>`;

const cards = rows.map(({ scenario, resolution, browserFile, cs2File, browserExists, cs2Exists }) => `
<article><header><strong>${scenario.id}</strong><span>${resolution.id} · checks: ${scenario.checks.join(', ')}</span></header>
<div class="comparison"><figure><figcaption>Browser</figcaption>${image(browserFile, browserExists, 'browser capture')}</figure>
<figure><figcaption>CS2 reference</figcaption>${image(cs2File, cs2Exists, 'CS2 reference')}</figure>
<figure class="overlay"><figcaption>50% overlay</figcaption>${browserExists && cs2Exists ? `<div><img src="${cs2File}" alt=""><img src="${browserFile}" alt="Browser and CS2 overlay"></div>` : '<div class="missing">Both captures required</div>'}</figure></div></article>`).join('');

const report = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>CS2 preview calibration</title><style>
body{margin:0;padding:24px;background:#050607;color:#eef6f4;font:14px system-ui}h1{margin:0 0 6px}.status{color:#9bb0ab;margin-bottom:24px}
article{border:1px solid #26302f;background:#0b0e0e;border-radius:10px;margin:0 0 20px;overflow:hidden}header{padding:12px 16px;display:flex;gap:12px;justify-content:space-between}header span,figcaption{color:#9bb0ab}
.comparison{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:#26302f}figure{margin:0;padding:12px;background:#080a0a}figcaption{margin-bottom:8px}
img,.missing{width:100%;aspect-ratio:16/9;object-fit:contain;background:#020303}.missing{display:grid;place-items:center;color:#d9a441}
.overlay>div{position:relative}.overlay img+img{position:absolute;inset:0;opacity:.5}@media(max-width:800px){.comparison{grid-template-columns:1fr}}
</style><body><h1>CS2 preview calibration report</h1><p class="status">${completePairs}/${rows.length} reference pairs complete. Acceptance target: representative edges within 1–2 px.</p>${cards}</body></html>`;

await writeFile(resolve(artifactDir, 'report.html'), report);
console.log(`preview calibration report: ${completePairs}/${rows.length} pairs complete; ${resolve(artifactDir, 'report.html')}`);
if (process.env.REQUIRE_CS2_REFERENCES === '1' && completePairs !== rows.length) process.exitCode = 1;
