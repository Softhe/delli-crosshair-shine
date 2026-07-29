import { lazy, Suspense, useState } from 'react';
import { CheckCircle2, HelpCircle, MousePointer2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FirstRunGuideProps {
	onDismiss: () => void;
}

const FirstRunHelp = lazy(() => import('@/components/studio/FirstRunHelp').then(({ FirstRunHelp: Component }) => ({ default: Component })));

export const FirstRunGuide = ({ onDismiss }: FirstRunGuideProps) => {
	const [helpOpen, setHelpOpen] = useState(false);
	return (
	<section data-testid="first-run-guide" aria-labelledby="first-run-title" className="rounded-lg border border-primary/25 bg-primary/[0.08] md:p-5">
		<div className="flex items-center gap-2 p-2 md:hidden">
			<h2 id="first-run-title" className="sr-only">Build your match-ready crosshair in three moves</h2>
			<ol aria-label="Getting started steps" className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr_auto_1fr] items-center text-center text-xs font-semibold text-foreground">
				<li>Import</li><li aria-hidden="true" className="text-primary">→</li><li>Tune</li><li aria-hidden="true" className="text-primary">→</li><li>Save</li>
			</ol>
			<Button type="button" variant="ghost" size="icon" aria-expanded={helpOpen} aria-controls="first-run-help" onClick={() => setHelpOpen((open) => !open)} className="h-8 w-8 shrink-0"><HelpCircle className="h-4 w-4" /><span className="sr-only">Getting started help</span></Button>
			<Button type="button" variant="ghost" size="icon" onClick={onDismiss} aria-label="Dismiss getting started guide" className="h-8 w-8 shrink-0"><X className="h-4 w-4" /></Button>
		</div>
		{helpOpen ? <div id="first-run-help" className="md:hidden"><Suspense fallback={<div className="h-24 animate-pulse bg-white/[0.03]" aria-hidden="true" />}><FirstRunHelp /></Suspense></div> : null}
		<div className="hidden md:block">
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
		</div>
	</section>
	);
};
