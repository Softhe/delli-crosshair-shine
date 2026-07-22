import { ClipboardCopy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileQuickActionsProps {
	onCopy: () => void;
	onDownload: () => void;
}

export const MobileQuickActions = ({ onCopy, onDownload }: MobileQuickActionsProps) => (
	<div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/90 p-3 shadow-2xl backdrop-blur-xl" data-testid="mobile-quick-actions">
		<div className="mx-auto grid max-w-md grid-cols-2 gap-2">
			<Button onClick={onCopy} aria-label="Quick copy command" className="bg-primary text-primary-foreground hover:bg-primary/90"><ClipboardCopy className="h-4 w-4" />Copy command</Button>
			<Button onClick={onDownload} aria-label="Quick download CFG" variant="outline" className="border-accent/40 bg-accent/10 text-foreground"><Download className="h-4 w-4" />Download CFG</Button>
		</div>
	</div>
);
