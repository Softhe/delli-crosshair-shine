import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDirectory = resolve('dist');
const indexPath = resolve(distDirectory, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');

const customHtml = indexHtml
  .replace(
    '<title>CS2 Crosshair Config Generator - delli.cc</title>',
    '<title>Custom CS2 Crosshair Builder - delli.cc</title>',
  )
  .replace(
    'content="Generate CS2 crosshair config files from share codes with live preview. Convert your CS2 crosshair settings instantly."',
    'content="Build a custom CS2 crosshair with a live preview, then copy its share code or console command."',
  )
  .replace('rel="canonical" href="https://delli.cc/"', 'rel="canonical" href="https://delli.cc/custom"')
  .replace('property="og:title" content="CS2 Crosshair Config Generator - delli.cc"', 'property="og:title" content="Custom CS2 Crosshair Builder - delli.cc"')
  .replace('property="og:description" content="Generate CS2 crosshair config files from share codes with live preview. Convert your CS2 crosshair settings instantly."', 'property="og:description" content="Build a custom CS2 crosshair with a live preview, then copy its share code or console command."')
  .replace('property="og:url" content="https://delli.cc/"', 'property="og:url" content="https://delli.cc/custom"')
  .replace('name="twitter:title" content="CS2 Crosshair Config Generator - delli.cc"', 'name="twitter:title" content="Custom CS2 Crosshair Builder - delli.cc"')
  .replace('name="twitter:description" content="Generate CS2 crosshair config files from share codes with live preview."', 'name="twitter:description" content="Build a custom CS2 crosshair with a live preview and export its settings."');

await mkdir(resolve(distDirectory, 'custom'), { recursive: true });
await Promise.all([
  writeFile(resolve(distDirectory, '404.html'), indexHtml),
  writeFile(resolve(distDirectory, 'custom.html'), customHtml),
  writeFile(resolve(distDirectory, 'custom', 'index.html'), customHtml),
]);
