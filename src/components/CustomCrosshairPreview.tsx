import { Card } from '@/components/ui/card';
import { CrosshairShape } from '@/components/CrosshairShape';
import { getCrosshairPreviewColor, type Crosshair } from '@/lib/cs2-sharecode';

interface CustomCrosshairPreviewProps {
	crosshair: Crosshair;
	className?: string;
	embedded?: boolean;
}

export const CustomCrosshairPreview = ({ crosshair, className = '', embedded = false }: CustomCrosshairPreviewProps) => {
	const color = getCrosshairPreviewColor(crosshair);
	const activeColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

	return (
		<Card className={`overflow-hidden p-0 ${embedded ? 'rounded-none border-0 bg-transparent shadow-none' : 'border-white/10 bg-card/75 shadow-2xl shadow-black/25 backdrop-blur-xl'} ${className}`}>
			<div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-3">
				<div>
					<h2 className="text-base font-semibold text-foreground">Live preview</h2>
					<p className="text-xs text-muted-foreground">Updates as you tune</p>
				</div>
				<div className="h-8 w-8 rounded-full border border-white/20" style={{ backgroundColor: activeColor }} role="img" aria-label={`Selected color ${activeColor}`} />
			</div>
			<div className="p-4">
				<div className={`relative flex items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,#d7b886,#8b7355_62%,#3d352c)] ${embedded ? 'aspect-[16/10] xl:aspect-[16/8.5] xl:max-h-[330px]' : 'aspect-[16/10]'}`} role="img" aria-label="Custom crosshair preview">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_26%,rgba(255,255,255,.26),transparent_15rem),linear-gradient(180deg,rgba(255,255,255,.1),rgba(0,0,0,.18))]" />
					<div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
					<div className="relative h-full w-full">
						<CrosshairShape crosshair={crosshair} />
					</div>
				</div>
			</div>
		</Card>
	);
};
