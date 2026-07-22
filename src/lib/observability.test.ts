import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getObservabilitySnapshot, trackStudioEvent } from '@/lib/observability';

describe('privacy-preserving observability', () => {
	beforeEach(() => sessionStorage.clear());

	it('stores aggregate event counts without values or identifiers', () => {
		const listener = vi.fn();
		window.addEventListener('cs2-studio:event', listener);
		trackStudioEvent('import_succeeded');
		trackStudioEvent('import_succeeded');
		const stored = sessionStorage.getItem('cs2_studio_session_metrics') || '';
		expect(getObservabilitySnapshot().events.import_succeeded).toBe(2);
		expect(stored).not.toContain('CSGO-');
		expect(stored).not.toContain('alias');
		expect(listener).toHaveBeenCalledTimes(2);
		window.removeEventListener('cs2-studio:event', listener);
	});
});
