export type StudioEventName = 'studio_loaded' | 'preset_selected' | 'import_succeeded' | 'import_failed' | 'copy_command' | 'copy_code' | 'share_link' | 'download_cfg' | 'palette_changed' | 'history_loaded' | 'app_error';

export interface ObservabilitySnapshot {
	events: Partial<Record<StudioEventName, number>>;
	viewport: 'small' | 'medium' | 'large';
	startedAt: string;
	performance: { lcp?: number; cls?: number };
}

const STORAGE_KEY = 'cs2_studio_session_metrics';

const viewportBucket = (): ObservabilitySnapshot['viewport'] => {
	if (typeof window === 'undefined') return 'large';
	if (window.innerWidth < 768) return 'small';
	if (window.innerWidth < 1280) return 'medium';
	return 'large';
};

const emptySnapshot = (): ObservabilitySnapshot => ({ events: {}, viewport: viewportBucket(), startedAt: new Date().toISOString(), performance: {} });

export const getObservabilitySnapshot = (): ObservabilitySnapshot => {
	try {
		const stored = sessionStorage.getItem(STORAGE_KEY);
		if (!stored) return emptySnapshot();
		const parsed = JSON.parse(stored) as ObservabilitySnapshot;
		return { ...emptySnapshot(), ...parsed, viewport: viewportBucket(), events: parsed.events || {}, performance: parsed.performance || {} };
	} catch { return emptySnapshot(); }
};

const saveSnapshot = (snapshot: ObservabilitySnapshot) => {
	try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Diagnostics must never affect the studio. */ }
};

export const trackStudioEvent = (name: StudioEventName) => {
	const snapshot = getObservabilitySnapshot();
	snapshot.events[name] = (snapshot.events[name] || 0) + 1;
	saveSnapshot(snapshot);
	if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cs2-studio:event', { detail: { name, viewport: snapshot.viewport } }));
};

export const initializeObservability = () => {
	if (typeof window === 'undefined') return () => undefined;
	const recordError = () => trackStudioEvent('app_error');
	window.addEventListener('error', recordError);
	window.addEventListener('unhandledrejection', recordError);
	let observer: PerformanceObserver | undefined;
	if ('PerformanceObserver' in window) {
		try {
			observer = new PerformanceObserver((list) => {
				const snapshot = getObservabilitySnapshot();
				for (const entry of list.getEntries()) {
					if (entry.entryType === 'largest-contentful-paint') snapshot.performance.lcp = Math.round(entry.startTime);
					if (entry.entryType === 'layout-shift') {
						const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
						if (!shift.hadRecentInput) snapshot.performance.cls = Number(((snapshot.performance.cls || 0) + (shift.value || 0)).toFixed(4));
					}
				}
				saveSnapshot(snapshot);
			});
			observer.observe({ type: 'largest-contentful-paint', buffered: true });
			observer.observe({ type: 'layout-shift', buffered: true });
		} catch { observer = undefined; }
	}
	return () => { window.removeEventListener('error', recordError); window.removeEventListener('unhandledrejection', recordError); observer?.disconnect(); };
};
