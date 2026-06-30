import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CrosshairPreview } from './CrosshairPreview';
import { Download, Crosshair, Check, AlertCircle, Sparkles, ClipboardCopy, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { decodeCrosshairShareCode, crosshairToConVars, InvalidShareCode, InvalidCrosshairShareCode } from '@/lib/cs2-sharecode';
import { addToHistory } from '@/lib/storage';
import { copyToClipboard } from '@/lib/clipboard';

// Example share codes for quick testing (from CS2 pro players)
const EXAMPLE_SHARE_CODES = [
	'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA', // ZywOo - Vitality
	'CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO', // NiKo - Falcons
	'CSGO-sXMJy-i8zaz-T4jvf-G8Ay7-b2D7K'  // s1mple - dot crosshair
];

const getCrosshairConVars = (shareCode: string): string => {
	if (!shareCode || !shareCode.startsWith('CSGO-')) {
		throw new Error('Share code must start with "CSGO-"');
	}

	try {
		const crosshair = decodeCrosshairShareCode(shareCode);
		return crosshairToConVars(crosshair);
	} catch (error) {
		if (error instanceof InvalidShareCode || error instanceof InvalidCrosshairShareCode) {
			throw new Error('Invalid crosshair share code format');
		}
		throw error;
	}
};

// This function converts CS2 share code to config commands
const generateConfig = (shareCode: string, aliasName?: string): string => {
	const convars = getCrosshairConVars(shareCode);
	const fileName = aliasName ? `crosshair_${aliasName}.cfg` : 'crosshair.cfg';
	const displayName = aliasName || 'mycrosshair';
	const aliasCommand = `alias "${displayName}" "exec ${fileName}"`;

	return `// CS2 Crosshair Config - Generated from ${shareCode}
// Place this file in your CS2 config folder
// Add this to your autoexec.cfg: ${aliasCommand}

// Crosshair settings
${convars}

echo "Crosshair config loaded successfully!"`;
};

const generateConsoleCommand = (shareCode: string): string => {
	const convars = getCrosshairConVars(shareCode);
	const commands = convars
		.split('\n')
		.map((line) => line.trim().replace(/"/g, ''))
		.filter(Boolean);

	return [...commands, 'host_writeconfig'].join('; ');
};
// Validate share code format
const validateShareCode = (code: string): { valid: boolean; error?: string } => {
	if (!code.trim()) {
		return { valid: false, error: 'Please enter a share code' };
	}

	if (!code.startsWith('CSGO-')) {
		return { valid: false, error: 'Share code must start with "CSGO-"' };
	}

	const parts = code.split('-');
	if (parts.length !== 6) {
		return { valid: false, error: 'Invalid format. Expected: CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX' };
	}

	try {
		decodeCrosshairShareCode(code);
		return { valid: true };
	} catch {
		return { valid: false, error: 'Unable to decode share code. Please verify it\'s correct.' };
	}
};

export const CS2ConfigGenerator = () => {
	const [shareCode, setShareCode] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const aliasName = '';
	const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const { toast } = useToast();


	// Validate share code on change (debounced)
	useEffect(() => {
		if (!shareCode.trim()) {
			setValidationState('idle');
			setErrorMessage('');
			return;
		}

		const timeoutId = setTimeout(() => {
			const result = validateShareCode(shareCode);
			setValidationState(result.valid ? 'valid' : 'invalid');
			setErrorMessage(result.error || '');
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [shareCode]);

	// Keyboard shortcut: Ctrl/Cmd + Enter to copy the console command
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
				e.preventDefault();
				if (shareCode.trim() && validationState === 'valid') {
					handleCopyConsoleCommand();
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [shareCode, validationState]);

	const addCrosshairToHistory = (code: string, alias?: string) => {
		try {
			const crosshair = decodeCrosshairShareCode(code);
			addToHistory({
				shareCode: code,
				aliasName: alias || undefined,
				settings: {
					style: crosshair.style,
					length: crosshair.length,
					thickness: crosshair.thickness,
					gap: crosshair.gap,
					outline: crosshair.outline,
					outlineEnabled: crosshair.outlineEnabled,
					centerDotEnabled: crosshair.centerDotEnabled,
					color: crosshair.color,
					alpha: crosshair.alpha,
					alphaEnabled: crosshair.alphaEnabled,
				},
			});
		} catch (err) {
			console.error('Failed to add to history:', err);
		}
	};

	const handleGenerate = async () => {
		if (!shareCode.trim()) {
			toast({
				title: "Error",
				description: "Please enter a valid CS2 share code",
				variant: "destructive",
			});
			return;
		}

		const validation = validateShareCode(shareCode);
		if (!validation.valid) {
			toast({
				title: "Invalid Share Code",
				description: validation.error,
				variant: "destructive",
			});
			return;
		}

		setIsGenerating(true);

		try {
			const config = generateConfig(shareCode, aliasName);

			// Create and download the config file
			const blob = new Blob([config], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			const fileName = aliasName ? `crosshair_${aliasName}.cfg` : 'crosshair.cfg';
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			// Add to history
			addCrosshairToHistory(shareCode, aliasName);

			toast({
				title: "Success!",
				description: `${fileName} downloaded successfully`,
			});

			// Optional: Play success sound
			playSuccessSound();
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to generate config",
				variant: "destructive",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCopyConsoleCommand = async () => {
		if (!shareCode.trim()) {
			toast({
				title: "Error",
				description: "Please enter a valid CS2 share code",
				variant: "destructive",
			});
			return;
		}

		const validation = validateShareCode(shareCode);
		if (!validation.valid) {
			toast({
				title: "Invalid Share Code",
				description: validation.error,
				variant: "destructive",
			});
			return;
		}

		try {
			const consoleCommand = generateConsoleCommand(shareCode);

			await copyToClipboard(consoleCommand);

			// Add to history
			addCrosshairToHistory(shareCode, aliasName);

			toast({
				title: "Copied!",
				description: "Console command copied. Paste it into the CS2 console to apply this crosshair instantly.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to copy console command. Try downloading instead.",
				variant: "destructive",
			});
		}
	};






	const handlePasteFromClipboard = async () => {
		try {
			if (!navigator.clipboard?.readText) {
				throw new Error('Clipboard reading is not available in this browser.');
			}

			const clipboardText = (await navigator.clipboard.readText()).trim();
			const validation = validateShareCode(clipboardText);

			if (!validation.valid) {
				toast({
					title: "Clipboard does not contain a valid share code",
					description: validation.error,
					variant: "destructive",
				});
				return;
			}

			setShareCode(clipboardText);
			toast({
				title: "Pasted!",
				description: "Share code pasted from clipboard",
			});
		} catch (error) {
			toast({
				title: "Paste failed",
				description: error instanceof Error ? error.message : "Unable to read from clipboard. Paste manually instead.",
				variant: "destructive",
			});
		}
	};


	const handleExampleCode = () => {
		const randomExample = EXAMPLE_SHARE_CODES[Math.floor(Math.random() * EXAMPLE_SHARE_CODES.length)];
		setShareCode(randomExample);
		toast({
			title: "Example loaded!",
			description: "Try generating a config with this example",
		});
	};



	// Optional: Play success sound (can be toggled off)
	const playSuccessSound = () => {
		// Simple beep using Web Audio API
		try {
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.value = 800;
			oscillator.type = 'sine';

			gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + 0.2);
		} catch {
			// Audio not supported or failed
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6">
			<div className="text-center space-y-3 animate-[fade-in_0.5s_ease-out]">
				<div className="flex items-center justify-center gap-3">
					<Crosshair className="w-7 h-7 text-neon-cyan" />
					<h1 className="text-3xl md:text-4xl font-bold text-foreground">CS2 Crosshair</h1>
				</div>
				<p className="text-sm md:text-base text-muted-foreground">Paste a share code, copy the console command, and apply it in-game.</p>
			</div>

			<Card className="card-gaming space-y-5 animate-[slide-in-up_0.5s_ease-out_0.1s_both]">
				<div className="space-y-3">
					<label htmlFor="shareCode" className="text-sm font-medium text-muted-foreground">Share code</label>
					<div className="relative">
						<Input
							id="shareCode"
							type="text"
							placeholder="CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA"
							value={shareCode}
							onChange={(e) => setShareCode(e.target.value)}
							className={`text-base py-5 pr-12 bg-secondary/50 border-tactical-blue/30 focus:border-neon-cyan transition-all duration-300 ${validationState === 'valid' ? 'border-success' : validationState === 'invalid' ? 'border-destructive' : ''}`}
						/>
						{validationState !== 'idle' && (
							<div className="absolute right-4 top-1/2 -translate-y-1/2">
								{validationState === 'valid' ? <Check className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
							</div>
						)}
					</div>

					{errorMessage && (
						<div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
							<AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
							<span>{errorMessage}</span>
						</div>
					)}

					<div className="flex flex-wrap gap-2">
						<Button onClick={handleExampleCode} variant="tactical" size="sm" className="btn-gaming-press">
							<Sparkles className="w-4 h-4" />
							Try Example
						</Button>
						<Button onClick={handlePasteFromClipboard} variant="tactical" size="sm" className="btn-gaming-press">
							<ClipboardPaste className="w-4 h-4" />
							Paste
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
					<Button onClick={handleCopyConsoleCommand} disabled={isGenerating || !shareCode.trim() || validationState !== 'valid'} variant="gaming" size="lg" className="text-base md:text-lg py-6 btn-gaming-press interactive-glow">
						<ClipboardCopy className="w-5 h-5" />
						Copy Console Command
					</Button>
					<Button onClick={handleGenerate} disabled={isGenerating || !shareCode.trim() || validationState !== 'valid'} variant="outline" size="lg" className="py-6 btn-gaming-press border-neon-cyan/30 hover:bg-neon-cyan/10">
						<Download className="w-5 h-5" />
						{isGenerating ? 'Generating...' : 'Download'}
					</Button>
				</div>

				<p className="text-xs text-center text-muted-foreground">
					Press <kbd className="px-2 py-1 bg-muted/50 rounded border border-muted">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted/50 rounded border border-muted">Enter</kbd> to copy the console command.
				</p>

				{shareCode && validationState === 'valid' && (
					<div className="flex flex-col items-center gap-3 border-t border-tactical-blue/20 pt-5 animate-[fade-in_0.3s_ease-out]">
						<h2 className="text-sm font-medium text-muted-foreground">Preview</h2>
						<CrosshairPreview shareCode={shareCode} />
					</div>
				)}
			</Card>

			<Card className="p-5 md:p-6 bg-card/30 border-tactical-blue/20 animate-[slide-in-up_0.5s_ease-out_0.2s_both]">
				<h2 className="text-base font-semibold text-neon-cyan mb-3">Use it in CS2</h2>
				<ol className="space-y-2 text-sm text-muted-foreground">
					<li>1. Copy your crosshair share code from CS2.</li>
					<li>2. Paste it here and copy the console command.</li>
					<li>3. Open the CS2 console, paste the command, and press Enter.</li>
				</ol>
			</Card>

			<p className="text-center text-xs text-muted-foreground">All processing happens locally in your browser.</p>
		</div>
	);
};
