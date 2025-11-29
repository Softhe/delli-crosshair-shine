import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

export const KeyboardShortcuts = () => {
	const shortcuts = [
		{
			category: 'General',
			items: [
				{ keys: ['Ctrl', 'Enter'], description: 'Generate config file' },
				{ keys: ['Escape'], description: 'Close dialogs and modals' },
			]
		},
		{
			category: 'Navigation',
			items: [
				{ keys: ['Tab'], description: 'Move to next input field' },
				{ keys: ['Shift', 'Tab'], description: 'Move to previous input field' },
			]
		},
		{
			category: 'Preview',
			items: [
				{ keys: ['+'], description: 'Zoom in crosshair preview' },
				{ keys: ['-'], description: 'Zoom out crosshair preview' },
				{ keys: ['0'], description: 'Reset zoom to default' },
			]
		}
	];

	const KeyboardKey = ({ children }: { children: string }) => (
		<kbd className="px-2.5 py-1.5 text-sm font-semibold bg-muted/80 border border-muted-foreground/20 rounded shadow-sm min-w-[2rem] inline-flex items-center justify-center">
			{children}
		</kbd>
	);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="tactical"
					size="sm"
					className="btn-gaming-press"
				>
					<Keyboard className="w-4 h-4" />
					Shortcuts
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl bg-card border-tactical-blue/30">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-2xl text-neon-cyan">
						<Keyboard className="w-6 h-6" />
						Keyboard Shortcuts
					</DialogTitle>
					<DialogDescription>
						Speed up your workflow with these keyboard shortcuts
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{shortcuts.map((category, idx) => (
						<div key={idx}>
							<h4 className="text-sm font-semibold text-neon-cyan mb-3 uppercase tracking-wide">
								{category.category}
							</h4>
							<div className="space-y-3">
								{category.items.map((shortcut, itemIdx) => (
									<div
										key={itemIdx}
										className="flex items-center justify-between gap-4 py-2 px-3 rounded-md bg-secondary/30 border border-tactical-blue/10 hover:bg-secondary/50 hover:border-tactical-blue/20 transition-colors"
									>
										<span className="text-sm text-foreground">
											{shortcut.description}
										</span>
										<div className="flex items-center gap-1.5">
											{shortcut.keys.map((key, keyIdx) => (
												<span key={keyIdx} className="flex items-center gap-1.5">
													<KeyboardKey>{key}</KeyboardKey>
													{keyIdx < shortcut.keys.length - 1 && (
														<span className="text-muted-foreground text-xs">+</span>
													)}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				<div className="mt-6 pt-6 border-t border-tactical-blue/20">
					<div className="bg-secondary/30 border border-tactical-blue/20 rounded-lg p-4">
						<h5 className="text-sm font-semibold text-neon-cyan mb-2">Pro Tip</h5>
						<p className="text-sm text-muted-foreground">
							Most shortcuts work globally within the tool. Some require focus on specific elements.
							You can always access this help dialog to remind yourself of available shortcuts.
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
