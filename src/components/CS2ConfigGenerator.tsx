import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CrosshairPreview } from './CrosshairPreview';
import { CrosshairHistory } from './CrosshairHistory';
import { AlertCircle, Check, ClipboardCopy, ClipboardPaste, Crosshair, Download, FileDown, ShieldCheck, Sparkles, TerminalSquare, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { decodeCrosshairShareCode, crosshairToConVars, InvalidShareCode, InvalidCrosshairShareCode } from '@/lib/cs2-sharecode';
import { addToHistory } from '@/lib/storage';
import { copyToClipboard } from '@/lib/clipboard';

const EXAMPLE_SHARE_CODES = [
	'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA',
	'CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO',
	'CSGO-sXMJy-i8zaz-T4jvf-G8Ay7-b2D7K'
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
host_writeconfig

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

const decodeUrlShareCode = (value: string | null): string => {
	if (!value) {
		return '';
	}

	try {
		return decodeURIComponent(value).trim();
	} catch {
		return value.trim();
	}
};

const getShareCodeFromUrl = (location: { pathname: string; search: string }): string => {
	const params = new URLSearchParams(location.search);
	const queryCode = params.get('code') || params.get('crosshair');

	if (queryCode) {
		return decodeUrlShareCode(queryCode);
	}

	const pathCode = location.pathname.split('/').filter(Boolean)[0];
	return decodeUrlShareCode(pathCode || null);
};

const getShareCodeUrlPath = (code: string): string => `/${encodeURIComponent(code)}`;

export const CS2ConfigGenerator = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [shareCode, setShareCode] = useState(() => getShareCodeFromUrl(location));
	const [isGenerating, setIsGenerating] = useState(false);
	const aliasName = '';
	const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [historyKey, setHistoryKey] = useState(0);
	const { toast } = useToast();

	useEffect(() => {
		const urlShareCode = getShareCodeFromUrl(location);
		setShareCode((currentShareCode) => currentShareCode === urlShareCode ? currentShareCode : urlShareCode);
	}, [location.pathname, location.search]);

	useEffect(() => {
		const trimmedShareCode = shareCode.trim();

		if (!trimmedShareCode) {
			if (location.pathname !== '/' || location.search) {
				navigate('/', { replace: true });
			}
			return;
		}

		if (!validateShareCode(trimmedShareCode).valid) {
			return;
		}

		const shareUrlPath = getShareCodeUrlPath(trimmedShareCode);
		if (location.pathname !== shareUrlPath || location.search) {
			navigate(shareUrlPath, { replace: true });
		}
	}, [shareCode, location.pathname, location.search, navigate]);

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
			setHistoryKey(prev => prev + 1);
		} catch (err) {
			console.error('Failed to add to history:', err);
		}
	};

	const handleGenerate = async () => {
		if (!shareCode.trim()) {
			toast({ title: "Error", description: "Please enter a valid CS2 share code", variant: "destructive" });
			return;
		}

		const validation = validateShareCode(shareCode);
		if (!validation.valid) {
			toast({ title: "Invalid Share Code", description: validation.error, variant: "destructive" });
			return;
		}

		setIsGenerating(true);

		try {
			const config = generateConfig(shareCode, aliasName);
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

			addCrosshairToHistory(shareCode, aliasName);
			toast({ title: "Success!", description: `${fileName} downloaded successfully` });
			playSuccessSound();
		} catch (error) {
			toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to generate config", variant: "destructive" });
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCopyConsoleCommand = async () => {
		if (!shareCode.trim()) {
			toast({ title: "Error", description: "Please enter a valid CS2 share code", variant: "destructive" });
			return;
		}

		const validation = validateShareCode(shareCode);
		if (!validation.valid) {
			toast({ title: "Invalid Share Code", description: validation.error, variant: "destructive" });
			return;
		}

		try {
			const consoleCommand = generateConsoleCommand(shareCode);
			await copyToClipboard(consoleCommand);
			addCrosshairToHistory(shareCode, aliasName);
			toast({ title: "Copied!", description: "Console command copied. Paste it into the CS2 console to apply this crosshair instantly." });
		} catch (error) {
			toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to copy console command. Try downloading instead.", variant: "destructive" });
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
				toast({ title: "Clipboard does not contain a valid share code", description: validation.error, variant: "destructive" });
				return;
			}

			setShareCode(clipboardText);
			toast({ title: "Pasted!", description: "Share code pasted from clipboard" });
		} catch (error) {
			toast({ title: "Paste failed", description: error instanceof Error ? error.message : "Unable to read from clipboard. Paste manually instead.", variant: "destructive" });
		}
	};

	const handleExampleCode = () => {
		const randomExample = EXAMPLE_SHARE_CODES[Math.floor(Math.random() * EXAMPLE_SHARE_CODES.length)];
		setShareCode(randomExample);
		toast({ title: "Example loaded!", description: "Try generating a config with this example" });
	};

	const handleSelectFromHistory = (historyShareCode: string) => {
		setShareCode(historyShareCode);
		toast({ title: "Loaded", description: "Crosshair loaded from history" });
	};

	const playSuccessSound = () => {
		try {
			const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
			if (!AudioContextClass) return;
			const audioContext = new AudioContextClass();
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
			// Audio is optional.
		}
	};

	const canSubmit = shareCode.trim() && validationState === 'valid';

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
			<header className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
				<div className="space-y-4">
					<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
						<ShieldCheck className="h-3.5 w-3.5 text-success" />
						Local browser conversion
					</div>
					<div className="max-w-3xl space-y-3">
						<h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-6xl">CS2 Crosshair</h1>
						<p className="text-base text-muted-foreground md:text-lg">Convert a CS2 share code into an instant console command or a clean downloadable config file.</p>
					</div>
				</div>
				<div className="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-card/60 p-2 text-center shadow-2xl shadow-black/20 backdrop-blur">
					<div className="rounded-md bg-white/[0.04] px-4 py-3">
						<p className="text-lg font-semibold text-foreground">1</p>
						<p className="text-xs text-muted-foreground">Paste</p>
					</div>
					<div className="rounded-md bg-white/[0.04] px-4 py-3">
						<p className="text-lg font-semibold text-foreground">2</p>
						<p className="text-xs text-muted-foreground">Preview</p>
					</div>
					<div className="rounded-md bg-white/[0.04] px-4 py-3">
						<p className="text-lg font-semibold text-foreground">3</p>
						<p className="text-xs text-muted-foreground">Apply</p>
					</div>
				</div>
			</header>

			<section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
				<div className="space-y-6">
					<Card className="overflow-hidden border-white/10 bg-card/75 p-0 shadow-2xl shadow-black/25 backdrop-blur-xl">
						<div className="border-b border-white/10 bg-white/[0.03] px-5 py-4 md:px-6">
							<div className="flex items-center justify-between gap-3">
								<div>
									<h2 className="text-base font-semibold text-foreground">Generator</h2>
									<p className="text-sm text-muted-foreground">Paste a valid CSGO share code to unlock actions.</p>
								</div>
								<Crosshair className="h-5 w-5 text-primary" />
							</div>
						</div>

						<div className="space-y-5 p-5 md:p-6">
							<div className="space-y-3">
								<label htmlFor="shareCode" className="text-sm font-medium text-foreground">Share code</label>
								<div className="relative">
									<Input
										id="shareCode"
										type="text"
										placeholder="CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA"
										value={shareCode}
										onChange={(e) => setShareCode(e.target.value)}
										className={`h-14 rounded-lg border-white/10 bg-background/70 pr-12 font-mono text-sm shadow-inner transition-colors focus:border-primary ${validationState === 'valid' ? 'border-success/70' : validationState === 'invalid' ? 'border-destructive/70' : ''}`}
									/>
									{validationState !== 'idle' && (
										<div className="absolute right-4 top-1/2 -translate-y-1/2">
											{validationState === 'valid' ? <Check className="h-5 w-5 text-success" /> : <AlertCircle className="h-5 w-5 text-destructive" />}
										</div>
									)}
								</div>

								{errorMessage && (
									<div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
										<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
										<span>{errorMessage}</span>
									</div>
								)}

								<div className="flex flex-wrap gap-2">
									<Button onClick={handleExampleCode} variant="secondary" size="sm" className="border border-white/10 bg-white/[0.05]">
										<Sparkles className="h-4 w-4" />
										Example
									</Button>
									<Button onClick={handlePasteFromClipboard} variant="secondary" size="sm" className="border border-white/10 bg-white/[0.05]">
										<ClipboardPaste className="h-4 w-4" />
										Paste
									</Button>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<Button onClick={handleCopyConsoleCommand} disabled={!canSubmit} size="lg" className="h-14 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
									<ClipboardCopy className="h-5 w-5" />
									Copy Command
								</Button>
								<Button onClick={handleGenerate} disabled={isGenerating || !canSubmit} variant="outline" size="lg" className="h-14 rounded-lg border-accent/40 bg-accent/10 text-foreground hover:bg-accent/15">
									<Download className="h-5 w-5" />
									{isGenerating ? 'Generating...' : 'Download CFG'}
								</Button>
							</div>

							<div className="grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
								<div className="rounded-lg border border-white/10 bg-background/45 p-4">
									<div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
										<TerminalSquare className="h-4 w-4 text-primary" />
										Console command
									</div>
									<ol className="space-y-2 text-sm text-muted-foreground">
										<li>1. Copy your crosshair share code from CS2.</li>
										<li>2. Paste it here and copy the console command.</li>
										<li>3. Open the CS2 console, paste the command, and press Enter.</li>
									</ol>
								</div>
								<div className="rounded-lg border border-white/10 bg-background/45 p-4">
									<div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
										<FileDown className="h-4 w-4 text-accent" />
										Download file
									</div>
									<ol className="space-y-2 text-sm text-muted-foreground">
										<li>1. Paste your share code and click Download.</li>
										<li>2. Move crosshair.cfg to your CS2 cfg folder.</li>
										<li>3. Open the CS2 console, type exec crosshair.cfg, and press Enter.</li>
									</ol>
								</div>
							</div>

							<p className="text-xs text-muted-foreground">
								Press <kbd className="rounded border border-white/10 bg-white/[0.06] px-2 py-1">Ctrl</kbd> + <kbd className="rounded border border-white/10 bg-white/[0.06] px-2 py-1">Enter</kbd> to copy the console command.
							</p>
						</div>
					</Card>

					<CrosshairHistory key={historyKey} onSelectCrosshair={handleSelectFromHistory} />
				</div>

				<aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
					<Card className="overflow-hidden border-white/10 bg-card/75 p-0 shadow-2xl shadow-black/25 backdrop-blur-xl">
						<div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4 md:px-6">
							<div>
								<h2 className="text-base font-semibold text-foreground">Live preview</h2>
								<p className="text-sm text-muted-foreground">Check contrast before you apply it.</p>
							</div>
							<Zap className="h-5 w-5 text-warning" />
						</div>
						<div className="p-4 md:p-5">
							<CrosshairPreview shareCode={shareCode} />
						</div>
					</Card>

					<div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
						<div className="rounded-lg border border-white/10 bg-card/55 p-4 backdrop-blur">
							<p className="text-xs uppercase text-muted-foreground">Output</p>
							<p className="mt-1 text-sm font-medium text-foreground">Console or .cfg</p>
						</div>
						<div className="rounded-lg border border-white/10 bg-card/55 p-4 backdrop-blur">
							<p className="text-xs uppercase text-muted-foreground">Storage</p>
							<p className="mt-1 text-sm font-medium text-foreground">Browser only</p>
						</div>
						<div className="rounded-lg border border-white/10 bg-card/55 p-4 backdrop-blur">
							<p className="text-xs uppercase text-muted-foreground">Format</p>
							<p className="mt-1 text-sm font-medium text-foreground">CSGO-xxxxx</p>
						</div>
					</div>
				</aside>
			</section>
		</div>
	);
};