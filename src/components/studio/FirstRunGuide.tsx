import { CheckCircle2, MousePointer2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FirstRunGuideProps {
	onDismiss: () => void;
}

export const FirstRunGuide = ({ onDismiss }: FirstRunGuideProps) => (
	<section data-testid="first-run-guide" aria-labelledby="first-run-title" className="rounded-lg border border-primary/25 bg-primary/[0.08] p-4 md:p-5">
		<div className="flex items-start justify-between gap-4">
			<div>
				<p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"><MousePointer2 className="h-3.5 w-3.5" /> Start here</p>
				<h2 id="first-run-title" className="text-lg font-semibold text-foreground">Build your match-ready crosshair in three moves</h2>
			</div>
			<Button type="button" variant="ghost" size="icon" onClick={onDismiss} aria-label="Dismiss getting started guide" className="h-9 w-9 shrink-0"><X className="h-4 w-4" /></Button>
		</div>
		<ol className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
			<li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Import or pick</strong><br />Paste a code or choose a preset.</span></li>
			<li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Tune and preview</strong><br />Adjust shape, color, and visibility.</span></li>
			<li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Save and switch</strong><br />Copy the command or download a CFG.</span></li>
		</ol>
	</section>
);
