import { CheckCircle2 } from 'lucide-react';

export const FirstRunHelp = () => (
	<ol className="grid gap-2 border-t border-white/10 px-3 py-3 text-sm text-muted-foreground">
		<li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Import or pick:</strong> paste a code or choose a preset.</span></li>
		<li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Tune and preview:</strong> adjust shape, color, and visibility.</span></li>
		<li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Save and switch:</strong> copy the command or download a CFG.</span></li>
	</ol>
);
