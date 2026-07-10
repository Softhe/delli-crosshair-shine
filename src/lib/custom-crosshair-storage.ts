import { decodeCrosshairShareCode, encodeCrosshair, type Crosshair } from '@/lib/cs2-sharecode';

const CUSTOM_CROSSHAIR_KEY = 'cs2_custom_crosshair_draft';

export const loadCustomCrosshair = (fallback: Crosshair): Crosshair => {
	try {
		const savedShareCode = localStorage.getItem(CUSTOM_CROSSHAIR_KEY);
		return savedShareCode ? decodeCrosshairShareCode(savedShareCode) : fallback;
	} catch {
		return fallback;
	}
};

export const saveCustomCrosshair = (crosshair: Crosshair): void => {
	try {
		localStorage.setItem(CUSTOM_CROSSHAIR_KEY, encodeCrosshair(crosshair));
	} catch {
		// Draft persistence is optional when storage is unavailable.
	}
};

export const clearCustomCrosshair = (): void => {
	try {
		localStorage.removeItem(CUSTOM_CROSSHAIR_KEY);
	} catch {
		// Reset still works even when storage is unavailable.
	}
};
