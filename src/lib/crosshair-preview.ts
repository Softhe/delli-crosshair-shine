import type { Crosshair } from './cs2-sharecode';

export interface CrosshairPreviewMetrics {
	length: number;
	thickness: number;
	edgeGap: number;
	outlineThickness: number;
	autoScale: number;
}

export const clampCrosshairNumber = (value: number, min: number, max: number): number => {
	if (!Number.isFinite(value)) {
		return min;
	}

	return Math.min(max, Math.max(min, value));
};

export const clampCrosshair = (crosshair: Crosshair): Crosshair => ({
	...crosshair,
	length: clampCrosshairNumber(crosshair.length, 0, 10),
	gap: clampCrosshairNumber(crosshair.gap, -10, 10),
	thickness: clampCrosshairNumber(crosshair.thickness, 0.5, 6),
	outline: clampCrosshairNumber(crosshair.outline, 0, 3),
	alpha: Math.round(clampCrosshairNumber(crosshair.alpha, 0, 255)),
	red: Math.round(clampCrosshairNumber(crosshair.red, 0, 255)),
	green: Math.round(clampCrosshairNumber(crosshair.green, 0, 255)),
	blue: Math.round(clampCrosshairNumber(crosshair.blue, 0, 255)),
	color: Math.round(clampCrosshairNumber(crosshair.color, 0, 5)),
	style: Math.round(clampCrosshairNumber(crosshair.style, 0, 4)),
	splitDistance: Math.round(clampCrosshairNumber(crosshair.splitDistance, 0, 16)),
	fixedCrosshairGap: clampCrosshairNumber(crosshair.fixedCrosshairGap, -10, 10),
	innerSplitAlpha: clampCrosshairNumber(crosshair.innerSplitAlpha, 0, 1),
	outerSplitAlpha: clampCrosshairNumber(crosshair.outerSplitAlpha, 0, 1),
	splitSizeRatio: clampCrosshairNumber(crosshair.splitSizeRatio, 0, 1),
});

export const getCrosshairPreviewMetrics = (crosshair: Crosshair): CrosshairPreviewMetrics => {
	const safeCrosshair = clampCrosshair(crosshair);
	const gameLengthPx = safeCrosshair.length * 10;
	const gameThicknessPx = Math.max(1, safeCrosshair.thickness * 2);
	const naturalSpan = Math.max(gameLengthPx * 2 + 12, 1);
	const autoScale = Math.min(6, Math.max(1, 34 / naturalSpan));
	const length = gameLengthPx * autoScale;
	const thickness = gameThicknessPx * autoScale;
	const rawEdgeGap = (safeCrosshair.gap + 4) * autoScale;
	const edgeGap = Math.max(rawEdgeGap, -Math.max(0, length - thickness));
	const outlineThickness = safeCrosshair.outlineEnabled && safeCrosshair.outline > 0
		? Math.max(0.5, safeCrosshair.outline * autoScale)
		: 0;

	return {
		length,
		thickness,
		edgeGap,
		outlineThickness,
		autoScale
	};
};
