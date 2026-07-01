import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import ts from 'typescript';

const loadTsModule = (path) => {
  const source = readFileSync(path, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const module = { exports: {} };
  new Script(outputText, { filename: path }).runInNewContext({ exports: module.exports, module, URLSearchParams });
  return module.exports;
};

const shareUrl = loadTsModule('src/lib/share-url.ts');
const config = loadTsModule('src/lib/crosshair-config.ts');

assert.equal(
  shareUrl.getShareCodeFromUrl({ pathname: '/CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA', search: '' }),
  'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA'
);
assert.equal(
  shareUrl.getShareCodeFromUrl({ pathname: '/', search: '?code=CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA' }),
  'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA'
);
assert.equal(
  shareUrl.getShareCodeUrlPath(' CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA '),
  '/CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA'
);

assert.equal(config.createConfigFileName('og small'), 'crosshair_og_small.cfg');
assert.equal(config.createConfigFileName('', 12345), 'crosshair_12345.cfg');
assert.match(config.createConfigFileName(), /^crosshair_\d{5}\.cfg$/);
assert.equal(config.getSafeAliasCommandName('og small'), 'og_small');
assert.equal(config.getSafeAliasCommandName(''), 'mycrosshair');
assert.equal(config.createAliasCommand('og small', 'crosshair_og_small.cfg'), 'alias "og_small" "exec crosshair_og_small.cfg"');

console.log('crosshair utility checks passed');