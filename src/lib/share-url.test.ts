import { describe, expect, it } from 'vitest';
import { getShareCodeFromUrl, getShareCodeUrlPath, getShareUrl } from './share-url';

const code = 'CSGO-AbCdE-FgHiJ-KlMnO-PqRsT-UvWxY';

describe('share URLs', () => {
  it('creates static-host-safe query links', () => {
    expect(getShareCodeUrlPath(code)).toBe(`/?code=${code}`);
    expect(getShareUrl(code, 'https://delli.cc')).toBe(`https://delli.cc/?code=${code}`);
  });

  it('reads current query links', () => {
    expect(getShareCodeFromUrl({ pathname: '/', search: `?code=${code}` })).toBe(code);
    expect(getShareCodeFromUrl({ pathname: '/', search: `?crosshair=${code}` })).toBe(code);
  });

  it('keeps legacy path links readable', () => {
    expect(getShareCodeFromUrl({ pathname: `/${code}`, search: '' })).toBe(code);
  });
});
