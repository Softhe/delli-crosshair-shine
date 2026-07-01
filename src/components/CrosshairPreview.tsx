import { useEffect, useState } from 'react';
import { decodeCrosshairShareCode, getCrosshairPreviewColor, type Crosshair, InvalidShareCode, InvalidCrosshairShareCode } from '@/lib/cs2-sharecode';
import { Monitor, Palette } from 'lucide-react';

interface CrosshairPreviewProps {
	shareCode: string;
}

type BackgroundType = 'dust2' | 'mirage' | 'inferno' | 'dark' | 'light';

export const CrosshairPreview = ({ shareCode }: CrosshairPreviewProps) => {
	const [crosshair, setCrosshair] = useState<Crosshair | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [backgroundType, setBackgroundType] = useState<BackgroundType>('dust2');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!shareCode?.trim()) {
			setCrosshair(null);
			setError(null);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		// Add a small delay to show loading state for better UX
		const timeoutId = setTimeout(() => {
			try {
				const decoded = decodeCrosshairShareCode(shareCode);
				setCrosshair(decoded);
				setError(null);
			} catch (err) {
				setCrosshair(null);
				if (err instanceof InvalidShareCode || err instanceof InvalidCrosshairShareCode) {
					setError('Invalid share code format');
				} else {
					setError('Failed to decode share code');
				}
			} finally {
				setIsLoading(false);
			}
		}, 150);

		return () => clearTimeout(timeoutId);
	}, [shareCode]);


	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-card/30 border border-tactical-blue/20 rounded-lg opacity-50">
					<div className="h-8 bg-secondary/50 rounded animate-pulse w-24"></div>
					<div className="h-8 bg-secondary/50 rounded animate-pulse w-16"></div>
					<div className="h-8 bg-secondary/50 rounded animate-pulse w-20"></div>
				</div>
				<div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
					<div className="flex flex-col items-center gap-2">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
						<div className="text-muted-foreground text-sm">Loading crosshair...</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-card/30 border border-tactical-blue/20 rounded-lg opacity-50">
					<div className="h-8 bg-secondary/50 rounded w-24"></div>
					<div className="h-8 bg-secondary/50 rounded w-16"></div>
					<div className="h-8 bg-secondary/50 rounded w-20"></div>
				</div>
				<div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
					<div className="text-destructive text-sm text-center px-4">
						<div className="mb-2">⚠️</div>
						{error}
					</div>
				</div>
			</div>
		);
	}

	if (!crosshair) {
		return (
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-card/30 border border-tactical-blue/20 rounded-lg opacity-50">
					<div className="h-8 bg-secondary/50 rounded w-24"></div>
					<div className="h-8 bg-secondary/50 rounded w-16"></div>
					<div className="h-8 bg-secondary/50 rounded w-20"></div>
				</div>
				<div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg">
					<div className="text-muted-foreground text-sm text-center">
						<Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
						Enter a CS2 share code to preview
					</div>
				</div>
			</div>
		);
	}

	const color = getCrosshairPreviewColor(crosshair);
	const crosshairColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
	const alpha = crosshair.alphaEnabled ? crosshair.alpha / 255 : 1;


	const gameLengthPx = crosshair.length * 10;
	const gameThicknessPx = Math.max(1, crosshair.thickness * 2);
	const gameGapPx = crosshair.gap + 4;

	const naturalLength = Math.max(1, gameLengthPx);
	const naturalThickness = Math.max(1, gameThicknessPx);
	const naturalEdgeGap = gameGapPx;
	const naturalSpan = Math.max(naturalLength * 2 + Math.max(0, naturalEdgeGap) * 2, naturalThickness);
	const autoScale = Math.min(6, Math.max(1, 34 / naturalSpan, 2 / naturalThickness));

	const length = naturalLength * autoScale;
	const thickness = naturalThickness * autoScale;
	const edgeGap = naturalEdgeGap * autoScale;
	const fromCenter = (offset: number) => `calc(50% ${offset < 0 ? '-' : '+'} ${Math.abs(offset)}px)`;
	const beforeCenter = (offset: number) => `calc(50% ${offset < 0 ? '+' : '-'} ${Math.abs(offset)}px)`;

	const outlineThickness = crosshair.outlineEnabled ?
		Math.max(0.5, crosshair.outline * autoScale) : 0;

	// Background variations
	const getBackgroundStyle = (type: BackgroundType) => {
		switch (type) {
			case 'dust2':
				return {
					background: 'linear-gradient(135deg, #d4a574 0%, #b8956a 25%, #8b7355 75%, #6b5940 100%)',
					overlay: `
            radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 60%, rgba(101, 67, 33, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(160, 82, 45, 0.15) 0%, transparent 30%)
          `
				};
			case 'mirage':
				return {
					background: 'linear-gradient(135deg, #e8d5b7 0%, #c4a57b 25%, #9a8065 75%, #7a6450 100%)',
					overlay: `
            radial-gradient(circle at 30% 20%, rgba(218, 165, 32, 0.2) 0%, transparent 60%),
            radial-gradient(circle at 70% 70%, rgba(184, 134, 11, 0.15) 0%, transparent 50%)
          `
				};
			case 'inferno':
				return {
					background: 'linear-gradient(135deg, #8b4513 0%, #654321 25%, #4a2c17 75%, #2d1810 100%)',
					overlay: `
            radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 75% 60%, rgba(101, 67, 33, 0.3) 0%, transparent 35%)
          `
				};
			case 'dark':
				return {
					background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 50%, #0f0f23 100%)',
					overlay: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)'
				};
			case 'light':
				return {
					background: 'linear-gradient(135deg, #f7fafc 0%, #e2e8f0 50%, #cbd5e0 100%)',
					overlay: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.05) 0%, transparent 70%)'
				};
			default:
				return {
					background: 'linear-gradient(135deg, #d4a574 0%, #b8956a 25%, #8b7355 75%, #6b5940 100%)',
					overlay: ''
				};
		}
	};

	const backgroundStyle = getBackgroundStyle(backgroundType);


	// Enhanced line styling with proper outline support (reverted)
	const lineStyle = {
		backgroundColor: crosshairColor,
		opacity: alpha,
		position: 'absolute' as const,
		zIndex: 10,
		borderRadius: '0.5px',
		// Proper outline implementation
		...(outlineThickness > 0 && {
			boxShadow: `0 0 0 ${outlineThickness}px rgba(0, 0, 0, 0.8)`
		})
	};

	return (
		<div className="space-y-4">
			{/* Control Panel */}
			<div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-card/30 border border-tactical-blue/20 rounded-lg">
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">Preview scale</span>
					<span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary">
						Auto {autoScale.toFixed(1)}x
					</span>
				</div>
				<div className="flex items-center gap-1">
					<Palette className="w-3 h-3 text-muted-foreground" />
					<select
						value={backgroundType}
						onChange={(e) => setBackgroundType(e.target.value as BackgroundType)}
						className="text-xs bg-secondary/50 border border-tactical-blue/30 rounded px-2 py-1 text-foreground"
					>
						<option value="dust2">Dust2</option>
						<option value="mirage">Mirage</option>
						<option value="inferno">Inferno</option>
						<option value="dark">Dark</option>
						<option value="light">Light</option>
					</select>
				</div>
			</div>

			{/* Preview Container */}
			<div className="aspect-[4/3] w-full max-w-[512px] flex items-center justify-center bg-secondary/30 border border-tactical-blue/20 rounded-lg relative overflow-hidden">
				{/* Dynamic background based on selection */}
				<div className="absolute inset-0" style={{ background: backgroundStyle.background }}></div>

				{/* Background overlay for texture */}
				<div className="absolute inset-0 opacity-20" style={{
					backgroundImage: backgroundStyle.overlay
				}}></div>

				{/* Subtle noise texture for realism */}
				<div className="absolute inset-0 opacity-5" style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					backgroundSize: '180px 180px'
				}}></div>

				{/* Dynamic lighting effect */}
				<div className="absolute inset-0" style={{
					background: backgroundType === 'light' ?
						`linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%)` :
						`
              radial-gradient(ellipse at 50% 20%, rgba(255, 248, 220, 0.08) 0%, transparent 60%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.1) 100%)
            `
				}}></div>

				{/* Crosshair container */}
				<div className="relative w-full h-full flex items-center justify-center">

					{/* Center dot with reverted outline */}
					{crosshair.centerDotEnabled && (
						<div
							style={{
								...lineStyle,
								width: `${thickness}px`,
								height: `${thickness}px`,
								borderRadius: '50%',
								left: '50%',
								top: '50%',
								transform: 'translate(-50%, -50%)',
								zIndex: 20
							}}
						/>
					)}

					{/* Horizontal lines with improved positioning - always show if calculated length > 0 */}
					<>
						{/* Left line */}
						<div
							style={{
								...lineStyle,
								width: `${length}px`,
								height: `${thickness}px`,
								left: beforeCenter(edgeGap + length),
								top: '50%',
								transform: 'translateY(-50%)'
							}}
						/>
						{/* Right line */}
						<div
							style={{
								...lineStyle,
								width: `${length}px`,
								height: `${thickness}px`,
								left: fromCenter(edgeGap),
								top: '50%',
								transform: 'translateY(-50%)'
							}}
						/>
					</>

					{/* Vertical lines with improved positioning - always show if calculated length > 0 */}
					<>
						{/* Top line */}
						<div
							style={{
								...lineStyle,
								width: `${thickness}px`,
								height: `${length}px`,
								left: '50%',
								top: beforeCenter(edgeGap + length),
								transform: 'translateX(-50%)'
							}}
						/>
						{/* Bottom line */}
						<div
							style={{
								...lineStyle,
								width: `${thickness}px`,
								height: `${length}px`,
								left: '50%',
								top: fromCenter(edgeGap),
								transform: 'translateX(-50%)'
							}}
						/>
					</>
				</div>
			</div>
		</div>
	);
};
