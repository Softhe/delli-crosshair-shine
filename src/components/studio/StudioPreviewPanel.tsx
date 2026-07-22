import { CustomCrosshairPreview } from '@/components/CustomCrosshairPreview';
import type { Crosshair } from '@/lib/cs2-sharecode';

interface StudioPreviewPanelProps {
	crosshair: Crosshair;
	compact: boolean;
}

export const StudioPreviewPanel = ({ crosshair, compact }: StudioPreviewPanelProps) => (
	<aside data-testid="preview-workspace" className="bg-background/20">
		{compact ? (
			<details data-testid="mobile-preview-disclosure" className="group">
				<summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-foreground">
					<span>Live preview</span>
					<span className="text-xs font-normal text-muted-foreground group-open:hidden">Show</span>
					<span className="hidden text-xs font-normal text-muted-foreground group-open:inline">Hide</span>
				</summary>
				<div className="border-t border-white/10"><CustomCrosshairPreview crosshair={crosshair} embedded /></div>
			</details>
		) : <CustomCrosshairPreview crosshair={crosshair} embedded />}
	</aside>
);
