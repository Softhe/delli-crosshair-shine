import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve('dist');
const requiredFiles = [
  'index.html',
  '404.html',
  'custom.html',
  'custom/index.html',
  'CNAME',
  'robots.txt',
  'sitemap.xml',
  'og-image.jpg',
];

await Promise.all(requiredFiles.map((file) => access(resolve(dist, file))));

const [indexHtml, notFoundHtml, customHtml, customIndexHtml, cname] = await Promise.all([
  readFile(resolve(dist, 'index.html'), 'utf8'),
  readFile(resolve(dist, '404.html'), 'utf8'),
  readFile(resolve(dist, 'custom.html'), 'utf8'),
  readFile(resolve(dist, 'custom/index.html'), 'utf8'),
  readFile(resolve(dist, 'CNAME'), 'utf8'),
]);

assert.match(indexHtml, /<title>CS2 Crosshair Studio - delli\.cc<\/title>/);
assert.match(indexHtml, /rel="canonical" href="https:\/\/delli\.cc\/"/);
assert.match(indexHtml, /property="og:image" content="https:\/\/delli\.cc\/og-image\.jpg"/);
assert.match(indexHtml, /<script type="module" crossorigin src="\/assets\/.+\.js"><\/script>/);
assert.equal(notFoundHtml, indexHtml, '404 fallback must boot the same client app');
assert.equal(customHtml, indexHtml, 'custom compatibility document must boot the same client app');
assert.equal(customIndexHtml, indexHtml, 'custom/index compatibility document must boot the same client app');
assert.equal(cname.trim(), 'delli.cc');

console.log(`verified ${requiredFiles.length} production build artifacts`);
