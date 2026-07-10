import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

class ResizeObserverMock implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

afterEach(() => {
	cleanup();
	localStorage.clear();
});
