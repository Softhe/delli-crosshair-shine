import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CrosshairShape } from '@/components/CrosshairShape';
import { CROSSHAIR_PREVIEW_FIXTURES } from '@/lib/crosshair-preview-fixtures';

describe.each(CROSSHAIR_PREVIEW_FIXTURES)('CrosshairShape fixture: $name', ({ crosshair, expected }) => {
	it('renders the expected visual parts and styles', () => {
		const { container } = render(<div style={{ width: 400, height: 300 }}><CrosshairShape crosshair={crosshair} /></div>);
		const arms = container.querySelectorAll('[data-crosshair-part="arm"]');
		const dot = container.querySelector('[data-crosshair-part="dot"]');
		expect(arms).toHaveLength(crosshair.length === 0 ? 0 : expected.arms);
		expect(Boolean(dot)).toBe(expected.dot);
		const visiblePart = dot ?? arms[0];
		if (!visiblePart) return;
		const style = (visiblePart as HTMLElement).style;
		expect(Number(style.opacity)).toBeCloseTo(expected.opacity, 4);
		expect(Boolean(style.boxShadow)).toBe(expected.outline);
		if (crosshair.color === 5) expect(style.backgroundColor).toBe('rgb(126, 32, 210)');
	});
});
