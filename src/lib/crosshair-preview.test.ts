import { describe, expect, it } from 'vitest';
import { decodeCrosshairShareCode } from '@/lib/cs2-sharecode';
import { getCrosshairPreviewMetrics } from '@/lib/crosshair-preview';

const BASE = decodeCrosshairShareCode('CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA');

describe('crosshair preview metrics', () => {
  it('keeps arm length stable when only thickness changes', () => {
    const thin = getCrosshairPreviewMetrics({ ...BASE, length: 2, thickness: 0.5 });
    const thick = getCrosshairPreviewMetrics({ ...BASE, length: 2, thickness: 6 });

    expect(thin.length).toBe(thick.length);
    expect(thick.thickness).toBeGreaterThan(thin.thickness);
  });

  it('does not draw an outline when its configured thickness is zero', () => {
    expect(getCrosshairPreviewMetrics({ ...BASE, outlineEnabled: true, outline: 0 }).outlineThickness).toBe(0);
    expect(getCrosshairPreviewMetrics({ ...BASE, outlineEnabled: true, outline: 1 }).outlineThickness).toBeGreaterThan(0);
  });

  it('responds monotonically to length and gap controls', () => {
    const short = getCrosshairPreviewMetrics({ ...BASE, length: 1 });
    const long = getCrosshairPreviewMetrics({ ...BASE, length: 5 });
    const tight = getCrosshairPreviewMetrics({ ...BASE, gap: -10 });
    const wide = getCrosshairPreviewMetrics({ ...BASE, gap: 10 });

    expect(long.length).toBeGreaterThan(short.length);
    expect(wide.edgeGap).toBeGreaterThan(tight.edgeGap);
  });
});
