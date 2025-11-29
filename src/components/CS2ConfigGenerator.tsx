import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CrosshairPreview } from './CrosshairPreview';
import { CrosshairHistory } from './CrosshairHistory';
import { FAQ } from './FAQ';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { Download, Copy, Crosshair, HelpCircle, Check, AlertCircle, Sparkles, Shield, Clock, Star, ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { decodeCrosshairShareCode, crosshairToConVars, InvalidShareCode, InvalidCrosshairShareCode } from '@/lib/cs2-sharecode';
import { addToHistory, toggleFavorite, isFavorited } from '@/lib/storage';
import { copyToClipboard } from '@/lib/clipboard';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

// Example share codes for quick testing (from CS2 pro players)
const EXAMPLE_SHARE_CODES = [
	'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA', // ZywOo - Vitality
	'CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO', // NiKo - Falcons
	'CSGO-sXMJy-i8zaz-T4jvf-G8Ay7-b2D7K'  // s1mple - dot crosshair
];

// This function converts CS2 share code to config commands
const generateConfig = (shareCode: string, aliasName?: string): string => {
	if (!shareCode || !shareCode.startsWith('CSGO-')) {
		throw new Error('Share code must start with "CSGO-"');
	}

	try {
		const crosshair = decodeCrosshairShareCode(shareCode);
		const convars = crosshairToConVars(crosshair);

		const fileName = aliasName ? `crosshair_${aliasName}.cfg` : 'crosshair.cfg';
		const displayName = aliasName || 'mycrosshair';
		const aliasCommand = `alias "${displayName}" "exec ${fileName}"`;

		return `// CS2 Crosshair Config - Generated from ${shareCode}
// Place this file in your CS2 config folder
// Add this to your autoexec.cfg: ${aliasCommand}

// Crosshair settings
${convars}

echo "Crosshair config loaded successfully!"`;
	} catch (error) {
		if (error instanceof InvalidShareCode || error instanceof InvalidCrosshairShareCode) {
			throw new Error('Invalid crosshair share code format');
		}
		throw error;
	}
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
	const [aliasName, setAliasName] = useState('');
	const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [isFavorite, setIsFavorite] = useState(false);
	const [historyKey, setHistoryKey] = useState(0);
	const { toast } = useToast();

	// Check favorite status when share code changes
	useEffect(() => {
		if (shareCode.trim() && validationState === 'valid') {
			setIsFavorite(isFavorited(shareCode));
		} else {
			setIsFavorite(false);
		}
	}, [shareCode, validationState]);

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

	// Keyboard shortcut: Ctrl/Cmd + Enter to generate
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
				e.preventDefault();
				if (shareCode.trim() && validationState === 'valid') {
					handleGenerate();
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

	const handleCopyConfig = async () => {
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
			const config = generateConfig(shareCode, aliasName);

			// Use utility function with fallback support
			await copyToClipboard(config);

			// Add to history
			addCrosshairToHistory(shareCode, aliasName);

			toast({
				title: "Copied!",
				description: "Config copied to clipboard. You can paste it directly into your config file.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to copy config. Try downloading instead.",
				variant: "destructive",
			});
		}
	};

	const handleToggleFavorite = () => {
		if (!shareCode.trim() || validationState !== 'valid') {
			return;
		}

		try {
			const crosshair = decodeCrosshairShareCode(shareCode);
			const newFavStatus = toggleFavorite({
				shareCode,
				aliasName: aliasName || undefined,
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

			setIsFavorite(newFavStatus);
			setHistoryKey(prev => prev + 1);

			toast({
				title: newFavStatus ? "Added to favorites" : "Removed from favorites",
				description: newFavStatus ? "Crosshair saved to favorites" : "Crosshair removed from favorites",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to update favorites",
				variant: "destructive",
			});
		}
	};

	const handleSelectFromHistory = (historyShareCode: string, historyAliasName?: string) => {
		setShareCode(historyShareCode);
		if (historyAliasName) {
			setAliasName(historyAliasName);
		}
		toast({
			title: "Loaded!",
			description: "Crosshair loaded from history",
		});
	};

	const handleCopyPath = async () => {
		const configPath = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg";
		try {
			await copyToClipboard(configPath);
			toast({
				title: "Copied!",
				description: "Config path copied to clipboard",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to copy to clipboard. Please copy manually.",
				variant: "destructive",
			});
		}
	};

	const handleCopyAlias = async () => {
		if (!aliasName.trim()) return;
		const fileName = `crosshair_${aliasName}.cfg`;
		const aliasCommand = `alias "${aliasName}" "exec ${fileName}"`;
		try {
			await copyToClipboard(aliasCommand);
			toast({
				title: "Copied!",
				description: "Alias command copied to clipboard",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to copy to clipboard. Please copy manually.",
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
		<div className="w-full max-w-7xl mx-auto section-spacing">
			{/* Header */}
			<div className="text-center space-y-4 animate-[fade-in_0.5s_ease-out]">
				<div className="flex items-center justify-center gap-3 mb-6">
					<Crosshair className="w-8 h-8 text-neon-cyan animate-pulse" />
					<h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
						CS2 Crosshair
					</h1>
				</div>
				<p className="text-lg text-muted-foreground">
					Convert share codes to config files instantly
				</p>
				<div className="text-sm text-neon-cyan font-mono">
					delli.cc
				</div>

				{/* Trust Signals */}
				<div className="flex flex-wrap items-center justify-center gap-3 mt-6">
					<span className="trust-badge">
						<Shield className="w-3 h-3" />
						Safe & Secure
					</span>
					<span className="trust-badge">
						<Check className="w-3 h-3" />
						Works with latest CS2
					</span>
					<span className="trust-badge">
						<Clock className="w-3 h-3" />
						Instant generation
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main Content - Left Side */}
				<div className="lg:col-span-2 space-y-8">
					{/* Main Tool */}
					<Card className="card-gaming space-y-6 animate-[slide-in-up_0.5s_ease-out_0.1s_both]">
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<label htmlFor="shareCode" className="text-lg font-semibold text-foreground">
									Enter your CS2 share code
								</label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button className="help-trigger">
												<HelpCircle className="w-3 h-3" />
											</button>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p className="text-sm">
												A share code is generated in CS2 when you click the "Share or Import" button
												in the crosshair settings. It looks like: <code className="text-neon-cyan">CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</code>
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>

							<div className="relative">
								<Input
									id="shareCode"
									type="text"
									placeholder="CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA"
									value={shareCode}
									onChange={(e) => setShareCode(e.target.value)}
									className={`text-lg py-6 pr-12 bg-secondary/50 border-tactical-blue/30 focus:border-neon-cyan transition-all duration-300 ${validationState === 'valid' ? 'border-success' :
										validationState === 'invalid' ? 'border-destructive' : ''
										}`}
								/>
								{/* Validation Icon */}
								{validationState !== 'idle' && (
									<div className="absolute right-4 top-1/2 -translate-y-1/2">
										{validationState === 'valid' ? (
											<Check className="w-5 h-5 text-success" />
										) : (
											<AlertCircle className="w-5 h-5 text-destructive" />
										)}
									</div>
								)}
							</div>

							{/* Error Message */}
							{errorMessage && (
								<div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
									<AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
									<span>{errorMessage}</span>
								</div>
							)}

							{/* Quick Actions */}
							<div className="flex flex-wrap gap-2">
								<Button
									onClick={handleExampleCode}
									variant="tactical"
									size="sm"
									className="btn-gaming-press"
								>
									<Sparkles className="w-4 h-4" />
									Try Example
								</Button>
								<Button
									onClick={handleToggleFavorite}
									variant="tactical"
									size="sm"
									className="btn-gaming-press"
									disabled={validationState !== 'valid'}
									title={isFavorite ? "Remove from favorites" : "Add to favorites"}
								>
									<Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
									{isFavorite ? 'Favorited' : 'Favorite'}
								</Button>
								<KeyboardShortcuts />
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<label htmlFor="aliasName" className="text-lg font-semibold text-foreground">
									Alias name (optional)
								</label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button className="help-trigger">
												<HelpCircle className="w-3 h-3" />
											</button>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p className="text-sm">
												Create a custom alias to quickly switch to this crosshair in-game.
												For example, if you name it "aim", you can type "aim" in console to load it.
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>

							<div className="space-y-2">
								<Input
									id="aliasName"
									type="text"
									placeholder="e.g., bluedynsmall"
									value={aliasName}
									onChange={(e) => setAliasName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
									className="text-lg py-6 bg-secondary/50 border-tactical-blue/30 focus:border-neon-cyan transition-all duration-300"
								/>
								{aliasName && (
									<div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-md border border-tactical-blue/20">
										<code className="text-sm text-neon-cyan font-mono flex-1">
											alias "{aliasName}" "exec crosshair_{aliasName}.cfg"
										</code>
										<Button onClick={handleCopyAlias} variant="tactical" size="sm" className="btn-gaming-press">
											<Copy className="w-4 h-4" />
										</Button>
									</div>
								)}
							</div>
						</div>

						{/* Crosshair Preview with enhanced information */}
						{shareCode && validationState === 'valid' && (
							<div className="flex flex-col items-center space-y-4 animate-[fade-in_0.3s_ease-out]">
								<h3 className="text-lg font-semibold text-neon-cyan">Crosshair Preview</h3>
								<CrosshairPreview shareCode={shareCode} />
								{(() => {
									try {
										const crosshair = decodeCrosshairShareCode(shareCode);
										return (
											<div className="w-full max-w-md bg-secondary/30 border border-tactical-blue/20 rounded-lg p-4 text-sm">
												<h4 className="font-semibold text-neon-cyan mb-2">Crosshair Settings</h4>
												<div className="grid grid-cols-2 gap-2 text-muted-foreground">
													<div>Style: <span className="text-foreground">{crosshair.style}</span></div>
													<div>Size: <span className="text-foreground">{crosshair.length}</span></div>
													<div>Thickness: <span className="text-foreground">{crosshair.thickness}</span></div>
													<div>Gap: <span className="text-foreground">{crosshair.gap}</span></div>
													<div>Outline: <span className="text-foreground">{crosshair.outlineEnabled ? crosshair.outline : 'Off'}</span></div>
													<div>Center Dot: <span className="text-foreground">{crosshair.centerDotEnabled ? 'On' : 'Off'}</span></div>
													<div>Color: <span className="text-foreground">
														{crosshair.color === 0 ? 'Red' :
															crosshair.color === 1 ? 'Green' :
																crosshair.color === 2 ? 'Yellow' :
																	crosshair.color === 3 ? 'Blue' :
																		crosshair.color === 4 ? 'Cyan' : 'Custom'}
													</span></div>
													<div>Alpha: <span className="text-foreground">{crosshair.alphaEnabled ? crosshair.alpha : 'Max'}</span></div>
												</div>
											</div>
										);
									} catch {
										return null;
									}
								})()}
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<Button
								onClick={handleGenerate}
								disabled={isGenerating || !shareCode.trim() || validationState !== 'valid'}
								variant="gaming"
								size="lg"
								className="text-lg py-6 btn-gaming-press interactive-glow"
							>
								<Download className="w-5 h-5" />
								{isGenerating ? 'Generating...' : 'Download Config'}
							</Button>
							<Button
								onClick={handleCopyConfig}
								disabled={isGenerating || !shareCode.trim() || validationState !== 'valid'}
								variant="outline"
								size="lg"
								className="text-lg py-6 btn-gaming-press border-neon-cyan/30 hover:bg-neon-cyan/10"
							>
								<ClipboardCopy className="w-5 h-5" />
								Copy to Clipboard
							</Button>
						</div>

						{/* Keyboard Shortcut Hint */}
						<p className="text-xs text-center text-muted-foreground">
							Press <kbd className="px-2 py-1 bg-muted/50 rounded border border-muted">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted/50 rounded border border-muted">Enter</kbd> to download
						</p>
					</Card>

					{/* Instructions */}
					<Card className="p-6 md:p-8 space-y-4 bg-card/30 border-tactical-blue/20 animate-[slide-in-up_0.5s_ease-out_0.2s_both]">
						<h3 className="text-lg font-semibold text-neon-cyan">How to use:</h3>
						<ol className="space-y-3 text-muted-foreground">
							<li className="flex items-start gap-3">
								<span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">1</span>
								<span>Copy your CS2 crosshair share code (Settings → Crosshair → Share or Import)</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">2</span>
								<span>Paste it in the input field above or click "Try Example" to test</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">3</span>
								<span>Click "Download Config" or "Copy to Clipboard" to get your config</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">4</span>
								<span>Place the .cfg file in your CS2 config folder</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">5</span>
								<div className="space-y-2 flex-1">
									<span>Config folder is probably located at:</span>
									<div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-md border border-tactical-blue/20">
										<code className="text-xs sm:text-sm text-neon-cyan font-mono flex-1 break-all">
											C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg
										</code>
										<Button
											onClick={handleCopyPath}
											variant="tactical"
											size="sm"
											className="btn-gaming-press flex-shrink-0"
										>
											<Copy className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<span className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 text-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">6</span>
								<span>Load the config in-game by opening the console (~) and typing: <code className="text-neon-cyan">exec crosshair.cfg</code></span>
							</li>
						</ol>
					</Card>

					{/* SEO Content - Tips & Info */}
					<Card className="p-6 md:p-8 space-y-4 bg-card/30 border-tactical-blue/20 animate-[slide-in-up_0.5s_ease-out_0.3s_both]">
						<h3 className="text-lg font-semibold text-neon-cyan">Why use config files?</h3>
						<div className="space-y-3 text-sm text-muted-foreground">
							<p>
								Config files allow you to save and quickly switch between different crosshair setups.
								This is especially useful for players who use different crosshairs for different weapons or situations.
							</p>
							<p>
								By creating aliases, you can instantly switch crosshairs with a simple console command during gameplay,
								giving you maximum flexibility and control over your visual settings.
							</p>
							<div className="bg-secondary/30 border border-tactical-blue/20 rounded-lg p-4 mt-4">
								<h4 className="font-semibold text-neon-cyan mb-2 text-base">Pro Tip</h4>
								<p>
									Add your crosshair configs to your <code className="text-neon-cyan">autoexec.cfg</code> to have them
									automatically available every time you launch CS2. You can bind them to keys for instant switching!
								</p>
							</div>
						</div>
					</Card>

					{/* FAQ Section */}
					<FAQ />
				</div>

				{/* Sidebar - Right Side */}
				<div className="lg:col-span-1">
					<div className="sticky top-4 space-y-6">
						<CrosshairHistory
							key={historyKey}
							onSelectCrosshair={handleSelectFromHistory}
						/>
					</div>
				</div>
			</div>

			{/* Footer Info */}
			<div className="text-center text-xs text-muted-foreground space-y-2 pt-4 animate-[fade-in_0.5s_ease-out_0.5s_both]">
				<p>No data is stored or transmitted. All processing happens locally in your browser.</p>
				<p className="flex items-center justify-center gap-2">
					<Shield className="w-3 h-3" />
					100% Privacy Guaranteed
				</p>
			</div>
		</div>
	);
};
