import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const VALID_CODE = 'CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO';

test('loads the unified studio without runtime or layout failures', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'CS2 Crosshair Studio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Customize' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Live preview' })).toBeVisible();

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);

  const customizeBox = await page.getByRole('heading', { name: 'Customize' }).boundingBox();
  const previewBox = await page.getByRole('heading', { name: 'Live preview' }).boundingBox();
  expect(customizeBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  if (testInfo.project.name === 'mobile-chromium') {
    expect(customizeBox!.y).toBeLessThan(previewBox!.y);
  } else {
    expect(Math.abs(customizeBox!.y - previewBox!.y)).toBeLessThan(100);
  }

  expect(errors).toEqual([]);
});

test('updates the preview, share code, URL, and draft from a preset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'High visibility' }).click();

  const codeInput = page.getByRole('textbox', { name: 'CS2 crosshair share code', exact: true });
  await expect(codeInput).toHaveValue(/^CSGO-/);
  const code = await codeInput.inputValue();
  await expect(page).toHaveURL(`/?code=${code}`);
  await expect(page.getByRole('button', { name: 'Yellow' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('img', { name: 'Selected color rgb(255, 255, 0)', exact: true }).filter({ visible: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cs2_custom_crosshair_draft'))).toBe(code);
});

test('copies active outputs, downloads the displayed file, and manages favorites', async ({ page }) => {
  await page.goto('/');
  const code = await page.getByRole('textbox', { name: 'CS2 crosshair share code', exact: true }).inputValue();

  await page.getByRole('button', { name: 'Copy code' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(code);

  await page.getByRole('button', { name: 'Share link', exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(`http://127.0.0.1:4175/?code=${code}`);

  await page.getByText('Optional alias and filename', { exact: true }).click();
  await page.getByLabel('Alias name').fill('team green');
  await expect(page.getByText('crosshair_team_green.cfg', { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CFG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('crosshair_team_green.cfg');
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const config = await readFile(downloadPath!, 'utf8');
  expect(config).toContain(`Generated from ${code}`);
  expect(config).toContain('alias "team_green" "exec crosshair_team_green.cfg"');

  await expect(page.getByRole('tab', { name: 'Recent (1)' })).toBeVisible();
  await page.getByRole('button', { name: 'Add team green to favorites' }).click();
  await expect(page.getByRole('tab', { name: 'Favorites (1)' })).toBeVisible();
});

test('pastes valid codes and exposes invalid clipboard values accessibly', async ({ page }) => {
  await page.goto('/');
  await page.evaluate((code) => navigator.clipboard.writeText(code), VALID_CODE);
  await page.getByRole('button', { name: 'Paste', exact: true }).click();
  const codeInput = page.getByRole('textbox', { name: 'CS2 crosshair share code', exact: true });
  await expect(codeInput).toHaveValue(VALID_CODE);
  await expect(page).toHaveURL(`/?code=${VALID_CODE}`);

  await page.evaluate(() => navigator.clipboard.writeText('invalid clipboard value'));
  await page.getByRole('button', { name: 'Paste', exact: true }).click();
  await expect(codeInput).toHaveValue('invalid clipboard value');
  await expect(page.getByRole('alert')).toContainText('Share code must start with');
});

test('supports compatibility routes and rejects invalid slugs', async ({ page }) => {
  await page.goto(`/custom?code=${VALID_CODE}#help`);
  await expect(page).toHaveURL(`/?code=${VALID_CODE}#help`);
  await expect(page.getByRole('textbox', { name: 'CS2 crosshair share code', exact: true })).toHaveValue(VALID_CODE);

  await page.goto(`/${VALID_CODE}`);
  await expect(page.getByRole('heading', { name: 'CS2 Crosshair Studio' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'CS2 crosshair share code', exact: true })).toHaveValue(VALID_CODE);

  await page.goto('/anything');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to the studio' })).toBeVisible();
});

test('has no automatically detectable WCAG A/AA violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'CS2 Crosshair Studio' })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
