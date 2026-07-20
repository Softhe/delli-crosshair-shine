import assert from 'node:assert/strict';

const baseUrl = (process.argv[2] || 'https://delli.cc').replace(/\/$/, '');
const validCode = 'CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO';
const expectedTitle = '<title>CS2 Crosshair Studio - delli.cc</title>';

const fetchText = async (path, attempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        redirect: 'follow',
        signal: AbortSignal.timeout(15_000)
      });
      return { response, body: await response.text() };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
  throw lastError;
};

let root;
for (let attempt = 1; attempt <= 6; attempt += 1) {
  try {
    root = await fetchText('/', 1);
  } catch {
    root = undefined;
  }
  if (root.response.status === 200 && root.body.includes(expectedTitle)) break;
  if (attempt < 6) await new Promise((resolve) => setTimeout(resolve, 10_000));
}

assert.equal(root?.response.status, 200, 'root must return HTTP 200');
assert.ok(root?.body.includes(expectedTitle), 'root must serve the unified studio metadata');

const query = await fetchText(`/?code=${validCode}`);
assert.equal(query.response.status, 200, 'canonical query share links must return HTTP 200');
assert.ok(query.body.includes(expectedTitle));

const custom = await fetchText('/custom/');
assert.equal(custom.response.status, 200, '/custom/ compatibility document must return HTTP 200');
assert.ok(custom.body.includes(expectedTitle));

const legacy = await fetchText(`/${validCode}`);
assert.ok([200, 404].includes(legacy.response.status), 'legacy share links must reach the SPA fallback');
assert.ok(legacy.body.includes(expectedTitle));

const missing = await fetchText('/definitely-not-a-real-route');
assert.equal(missing.response.status, 404, 'unknown paths must retain an HTTP 404 status');
assert.ok(missing.body.includes(expectedTitle));

console.log(`production smoke checks passed for ${baseUrl}`);
