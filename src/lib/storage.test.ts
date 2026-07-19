import { describe, expect, it } from 'vitest';
import {
	addToHistory,
	exportAllData,
	getFavorites,
	getHistory,
	getUserSettings,
	importAllData,
	isFavorited,
	saveUserSettings,
	toggleFavorite,
} from '@/lib/storage';

const FIRST_CODE = 'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA';
const SECOND_CODE = 'CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO';

describe('crosshair history and favorites persistence', () => {
	it('deduplicates recent history and keeps the newest alias', () => {
		addToHistory({ shareCode: FIRST_CODE, aliasName: 'old' });
		addToHistory({ shareCode: SECOND_CODE });
		addToHistory({ shareCode: FIRST_CODE, aliasName: 'updated' });

		expect(getHistory()).toHaveLength(2);
		expect(getHistory().map(({ shareCode }) => shareCode)).toEqual([FIRST_CODE, SECOND_CODE]);
		expect(getHistory()[0].aliasName).toBe('updated');
	});

	it('toggles a favorite without creating duplicates', () => {
		const favorite = { shareCode: FIRST_CODE, aliasName: 'favorite' };
		expect(toggleFavorite(favorite)).toBe(true);
		expect(isFavorited(FIRST_CODE)).toBe(true);
		expect(getFavorites()).toEqual([expect.objectContaining({ ...favorite, isFavorite: true })]);

		expect(toggleFavorite(favorite)).toBe(false);
		expect(isFavorited(FIRST_CODE)).toBe(false);
		expect(getFavorites()).toEqual([]);
	});

	it('exports and restores history, favorites, and settings as one backup', () => {
		addToHistory({ shareCode: FIRST_CODE, aliasName: 'restored' });
		toggleFavorite({ shareCode: SECOND_CODE });
		saveUserSettings({ previewBackground: 'dust' });
		const backup = exportAllData();

		localStorage.clear();
		expect(importAllData(backup)).toEqual({ success: true });
		expect(getHistory()).toEqual([expect.objectContaining({ shareCode: FIRST_CODE, aliasName: 'restored' })]);
		expect(getFavorites()).toEqual([expect.objectContaining({ shareCode: SECOND_CODE, isFavorite: true })]);
		expect(getUserSettings()).toEqual({ previewBackground: 'dust' });
	});
});
