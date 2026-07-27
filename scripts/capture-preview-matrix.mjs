import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:4175';
const outputDir = resolve('artifacts/preview-calibration');
const scenarios = [
  { id: 'compact', button: 'Small static' },
  { id: 'dot', button: 'Dot' },
  { id: 'outlined', button: 'High visibility' },
  { id: 'classic', button: 'Classic green' },
  { id: 'partial-alpha', shareCode: 'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA' },
];
const resolutions = [
  { id: '1920x1080', width: 1920, height: 1080 },
  { id: '2560x1440', width: 2560, height: 1440 },
  { id: '1280x960-stretched', width: 1280, height: 960 },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });

for (const resolution of resolutions) {
  await page.setViewportSize({ width: resolution.width, height: resolution.height });
  for (const scenario of scenarios) {
    await page.goto(scenario.shareCode ? `${baseUrl}/?code=${scenario.shareCode}` : baseUrl);
    if (scenario.button) await page.getByRole('button', { name: scenario.button, exact: true }).click();
    await page.getByTestId('preview-workspace').screenshot({
      path: resolve(outputDir, `${scenario.id}-${resolution.id}-browser.png`),
    });
  }
}

await browser.close();
console.log(`captured ${scenarios.length * resolutions.length} browser preview references in ${outputDir}`);
