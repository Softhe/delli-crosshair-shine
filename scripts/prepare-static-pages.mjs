import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDirectory = resolve('dist');
const indexPath = resolve(distDirectory, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');

await mkdir(resolve(distDirectory, 'custom'), { recursive: true });
await Promise.all([
  writeFile(resolve(distDirectory, '404.html'), indexHtml),
  writeFile(resolve(distDirectory, 'custom.html'), indexHtml),
  writeFile(resolve(distDirectory, 'custom', 'index.html'), indexHtml),
]);
