import { decodeCrosshairShareCode, type Crosshair } from '@/lib/cs2-sharecode';

const BASE = decodeCrosshairShareCode('CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA');

export interface CrosshairPreviewFixture {
	name: string;
	crosshair: Crosshair;
	expected: {
		arms: 3 | 4;
		dot: boolean;
		outline: boolean;
		opacity: number;
	};
}

export const CROSSHAIR_PREVIEW_FIXTURES: CrosshairPreviewFixture[] = [
	{ name: 'compact negative gap', crosshair: { ...BASE, length: 1, gap: -10, thickness: 0.5 }, expected: { arms: 4, dot: false, outline: false, opacity: 1 } },
	{ name: 'maximum gap', crosshair: { ...BASE, length: 5, gap: 10 }, expected: { arms: 4, dot: false, outline: false, opacity: 1 } },
	{ name: 'outlined heavy arms', crosshair: { ...BASE, thickness: 6, outlineEnabled: true, outline: 3 }, expected: { arms: 4, dot: false, outline: true, opacity: 1 } },
	{ name: 'center dot', crosshair: { ...BASE, length: 0, centerDotEnabled: true, thickness: 2 }, expected: { arms: 4, dot: true, outline: false, opacity: 1 } },
	{ name: 'T style', crosshair: { ...BASE, tStyleEnabled: true }, expected: { arms: 3, dot: false, outline: false, opacity: 1 } },
	{ name: 'partial alpha', crosshair: { ...BASE, alphaEnabled: true, alpha: 128 }, expected: { arms: 4, dot: false, outline: false, opacity: 128 / 255 } },
	{ name: 'custom color', crosshair: { ...BASE, color: 5, red: 126, green: 32, blue: 210 }, expected: { arms: 4, dot: false, outline: false, opacity: 1 } }
];
