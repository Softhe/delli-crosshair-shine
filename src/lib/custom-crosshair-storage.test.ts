import { describe, expect, it } from 'vitest';
import { decodeCrosshairShareCode } from '@/lib/cs2-sharecode';
import { clearCustomCrosshair, loadCustomCrosshair, saveCustomCrosshair } from '@/lib/custom-crosshair-storage';

const CODE = 'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA';

describe('custom crosshair storage', () => {
	it('round-trips a saved draft', () => {
		const crosshair = decodeCrosshairShareCode(CODE);
		saveCustomCrosshair(crosshair);
		expect(loadCustomCrosshair({ ...crosshair, length: 0 })).toEqual(crosshair);
	});

	it('uses the fallback for corrupt data and after clearing', () => {
		const fallback = decodeCrosshairShareCode(CODE);
		localStorage.setItem('cs2_custom_crosshair_draft', 'invalid');
		expect(loadCustomCrosshair(fallback)).toEqual(fallback);
		clearCustomCrosshair();
		expect(loadCustomCrosshair(fallback)).toEqual(fallback);
	});
});
