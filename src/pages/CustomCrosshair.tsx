import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ClipboardCopy, Crosshair as CrosshairIcon, ExternalLink, Pipette, RotateCcw, SlidersHorizontal, TerminalSquare, Wand2 } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/clipboard';
import { crosshairToConVars, decodeCrosshairShareCode, encodeCrosshair, getCrosshairPreviewColor, InvalidCrosshairShareCode, InvalidShareCode, type Crosshair } from '@/lib/cs2-sharecode';
import { CrosshairShape } from '@/components/CrosshairShape';
import { clampCrosshair } from '@/lib/crosshair-preview';
import { clearCustomCrosshair, loadCustomCrosshair, saveCustomCrosshair } from '@/lib/custom-crosshair-storage';
import { getShareCodeUrlPath } from '@/lib/share-url';
import { hexToRgb, rgbToHex } from '@/lib/color';

const DEFAULT_CROSSHAIR: Crosshair = {
	length: 2,
	red: 0,
	green: 255,
	blue: 255,
	gap: -2,
	alphaEnabled: true,
	alpha: 255,
	outlineEnabled: false,
	outline: 1,
	color: 4,
	thickness: 1,
	centerDotEnabled: false,
	splitDistance: 7,
	fixedCrosshairGap: 3,
	innerSplitAlpha: 1,
	outerSplitAlpha: 0.5,
	splitSizeRatio: 0.3,
	tStyleEnabled: false,
	deployedWeaponGapEnabled: false,
	style: 4
};

const COLOR_OPTIONS = [
	{ label: 'Red', value: 0, swatch: 'rgb(255, 0, 0)' },
	{ label: 'Green', value: 1, swatch: 'rgb(0, 255, 0)' },
	{ label: 'Yellow', value: 2, swatch: 'rgb(255, 165, 0)' },
	{ label: 'Blue', value: 3, swatch: 'rgb(0, 0, 255)' },
	{ label: 'Cyan', value: 4, swatch: 'rgb(0, 255, 255)' }
];

const PRESETS: Array<{ name: string; description: string; crosshair: Crosshair }> = [
	{
		name: 'Small static',
		description: 'Compact cyan crosshair with a slight negative gap.',
		crosshair: DEFAULT_CROSSHAIR
	},
	{
		name: 'Dot',
		description: 'Center dot only for minimal visual noise.',
		crosshair: {
			...DEFAULT_CROSSHAIR,
			length: 0,
			gap: -4,
			thickness: 1.5,
			centerDotEnabled: true,
			color: 1,
			red: 0,
			green: 255,
			blue: 0
		}
	},
	{
		name: 'High visibility',
		description: 'Larger yellow arms for busy backgrounds.',
		crosshair: {
			...DEFAULT_CROSSHAIR,
			length: 3.5,
			gap: -1,
			thickness: 1.5,
			outlineEnabled: true,
			outline: 1,
			color: 2
		}
	},
	{
		name: 'Classic green',
		description: 'Traditional green static style with center dot.',
		crosshair: {
			...DEFAULT_CROSSHAIR,
			length: 2.5,
			gap: -3,
			thickness: 1,
			centerDotEnabled: true,
			color: 1
		}
	}
];

type NumberKey = {
	[K in keyof Crosshair]: Crosshair[K] extends number ? K : never;
}[keyof Crosshair];

type BooleanKey = {
	[K in keyof Crosshair]: Crosshair[K] extends boolean ? K : never;
}[keyof Crosshair];

interface SettingSliderProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	disabled?: boolean;
	onChange: (value: number) => void;
}

const SettingSlider = ({ label, value, min, max, step, disabled, onChange }: SettingSliderProps) => (
	<div className={disabled ? 'space-y-2 opacity-45' : 'space-y-2'}>
		<div className="flex items-center justify-between gap-3">
			<span className="text-sm font-medium text-foreground">{label}</span>
			<span className="rounded border border-white/10 bg-background/70 px-2 py-1 font-mono text-xs text-muted-foreground">
				{value.toFixed(step < 1 ? 1 : 0)}
			</span>
		</div>
		<Slider thumbLabel={label} value={[value]} min={min} max={max} step={step} disabled={disabled} onValueChange={([next]) => onChange(next)} />
	</div>
);

interface SettingToggleProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

const SettingToggle = ({ label, checked, onChange }: SettingToggleProps) => (
	<label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${checked ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-white/10 bg-background/45 text-muted-foreground hover:bg-white/[0.05]'}`}>
		<span>{label}</span>
		<Checkbox checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
	</label>
);

const CustomCrosshair = () => {
	const [crosshair, setCrosshair] = useState<Crosshair>(() => loadCustomCrosshair(DEFAULT_CROSSHAIR));
	const [importCode, setImportCode] = useState('');
	const [importError, setImportError] = useState('');
	const [customColorOpen, setCustomColorOpen] = useState(false);
	const { toast } = useToast();
	const shareCode = useMemo(() => encodeCrosshair(crosshair), [crosshair]);
	const convars = useMemo(() => crosshairToConVars(crosshair), [crosshair]);
	const previewColor = getCrosshairPreviewColor(crosshair);
	const activeColor = `rgb(${previewColor.r}, ${previewColor.g}, ${previewColor.b})`;
	const customHexColor = rgbToHex(crosshair.red, crosshair.green, crosshair.blue);
	const updateCrosshair = (nextCrosshair: Crosshair) => setCrosshair(clampCrosshair(nextCrosshair));
	const updateNumber = (key: NumberKey, value: number) => setCrosshair((current) => clampCrosshair({ ...current, [key]: value }));
	const updateBoolean = (key: BooleanKey, value: boolean) => setCrosshair((current) => clampCrosshair({ ...current, [key]: value }));
	const updateCustomColor = (hex: string) => {
		const rgb = hexToRgb(hex);
		if (!rgb) return;
		setCrosshair((current) => clampCrosshair({ ...current, color: 5, ...rgb }));
	};

	useEffect(() => {
		saveCustomCrosshair(crosshair);
	}, [crosshair]);

	const handleReset = () => {
		clearCustomCrosshair();
		setCrosshair(DEFAULT_CROSSHAIR);
		setImportCode('');
		setImportError('');
		setCustomColorOpen(false);
	};

	const handleCopy = async (value: string, title: string) => {
		try {
			await copyToClipboard(value);
			toast({ title, description: 'Copied to clipboard.' });
		} catch {
			toast({ title: 'Copy failed', description: 'Unable to write to clipboard.', variant: 'destructive' });
		}
	};

	const handleImport = () => {
		const trimmedImportCode = importCode.trim();

		try {
			const decodedCrosshair = decodeCrosshairShareCode(trimmedImportCode);
			updateCrosshair(decodedCrosshair);
			setImportCode(trimmedImportCode);
			setImportError('');
			toast({ title: 'Crosshair imported', description: 'The custom builder now starts from that share code.' });
		} catch (error) {
			const description = error instanceof InvalidShareCode || error instanceof InvalidCrosshairShareCode
				? 'Enter a valid CS2 crosshair share code.'
				: 'Unable to import that share code.';
			setImportError(description);
			toast({ title: 'Import failed', description, variant: 'destructive' });
		}
	};

	return (
		<main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
				<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-3">
						<Button asChild variant="secondary" size="sm" className="w-fit border border-white/10 bg-white/[0.05]">
							<Link to="/">
								<ArrowLeft className="h-4 w-4" />
								Back to converter
							</Link>
						</Button>
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
								<SlidersHorizontal className="h-3.5 w-3.5" />
								Custom builder
							</div>
							<h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-5xl">Create a custom crosshair</h1>
							<p className="max-w-xl text-base text-muted-foreground">
								Tune the common CS2 crosshair values, preview the result, then copy a share code or console command.
							</p>
						</div>
					</div>
					<Button onClick={handleReset} variant="outline" className="border-white/10 bg-white/[0.04]">
						<RotateCcw className="h-4 w-4" />
						Reset
					</Button>
				</header>

				<section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(390px,0.82fr)]">
					<Card className="border-white/10 bg-card/75 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl md:p-6">
						<div className="mb-5 flex items-center justify-between gap-3">
							<div>
								<h2 className="text-base font-semibold text-foreground">Settings</h2>
								<p className="text-sm text-muted-foreground">Basic values match CS2 console variable ranges closely enough for practical tuning.</p>
							</div>
							<CrosshairIcon className="h-5 w-5 text-primary" />
						</div>

						<div className="mb-6 grid gap-3 md:grid-cols-2">
							<div className="rounded-lg border border-white/10 bg-background/45 p-4">
								<div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
									<Wand2 className="h-4 w-4 text-primary" />
									Presets
								</div>
								<div className="grid gap-2 sm:grid-cols-2">
									{PRESETS.map((preset) => (
										<button
											key={preset.name}
											onClick={() => updateCrosshair(preset.crosshair)}
											className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
										>
											<span className="block text-sm font-medium text-foreground">{preset.name}</span>
											<span className="mt-1 block text-xs text-muted-foreground">{preset.description}</span>
										</button>
									))}
								</div>
							</div>

							<div className="rounded-lg border border-white/10 bg-background/45 p-4">
								<div className="mb-3 text-sm font-semibold text-foreground">Import share code</div>
								<div className="flex flex-col gap-2 sm:flex-row">
									<Input
										aria-label="CS2 crosshair share code"
										aria-invalid={Boolean(importError)}
										aria-describedby={importError ? 'import-code-error' : undefined}
										value={importCode}
										onChange={(event) => {
											setImportCode(event.target.value);
											setImportError('');
										}}
										placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
										className="h-10 border-white/10 bg-background/70 font-mono text-xs"
									/>
									<Button onClick={handleImport} variant="secondary" className="border border-primary/25 bg-primary/10 text-foreground hover:bg-primary/15">Import</Button>
								</div>
								{importError && <p id="import-code-error" role="alert" className="mt-2 text-xs text-destructive">{importError}</p>}
							</div>
						</div>

						<div className="grid gap-6 lg:grid-cols-2">
							<div className="space-y-5">
								<SettingSlider label="Length" value={crosshair.length} min={0} max={10} step={0.5} onChange={(value) => updateNumber('length', value)} />
								<SettingSlider label="Thickness" value={crosshair.thickness} min={0.5} max={6} step={0.5} onChange={(value) => updateNumber('thickness', value)} />
								<SettingSlider label="Gap" value={crosshair.gap} min={-10} max={10} step={0.5} onChange={(value) => updateNumber('gap', value)} />
								<SettingSlider label="Outline thickness" value={crosshair.outline} min={0} max={3} step={0.5} disabled={!crosshair.outlineEnabled} onChange={(value) => updateNumber('outline', value)} />
							</div>

							<div className="space-y-5">
								<div className="space-y-3">
									<label className="text-sm font-medium text-foreground">Color</label>
									<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
										{COLOR_OPTIONS.map((option) => (
											<button
												key={option.value}
												type="button"
												aria-pressed={crosshair.color === option.value}
												onClick={() => updateNumber('color', option.value)}
												className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${crosshair.color === option.value ? 'border-primary bg-primary/15 text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]' : 'border-white/10 bg-background/45 text-muted-foreground hover:bg-white/[0.06]'}`}
											>
												<span className="h-4 w-4 rounded-full border border-white/25 shadow-inner" style={{ background: option.value === 5 ? activeColor : option.swatch }} />
												{option.label}
												{crosshair.color === option.value && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
											</button>
										))}
										<Popover open={customColorOpen} onOpenChange={setCustomColorOpen}>
											<PopoverTrigger asChild>
												<button
													type="button"
													aria-pressed={crosshair.color === 5}
													onClick={() => updateNumber('color', 5)}
													className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${crosshair.color === 5 ? 'border-primary bg-primary/15 text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]' : 'border-white/10 bg-background/45 text-muted-foreground hover:bg-white/[0.06]'}`}
												>
													<span className="h-4 w-4 rounded-full border border-white/25 shadow-inner" style={{ backgroundColor: customHexColor }} />
													Custom
													{crosshair.color === 5 ? <Check className="ml-auto h-3.5 w-3.5 text-primary" /> : <Pipette className="ml-auto h-3.5 w-3.5" />}
												</button>
											</PopoverTrigger>
											<PopoverContent align="end" className="w-72 border-white/10 bg-popover/95 p-4 shadow-2xl backdrop-blur-xl">
												<div className="mb-3 flex items-center justify-between gap-3">
													<div>
														<h3 className="text-sm font-semibold text-foreground">Choose custom color</h3>
														<p className="text-xs text-muted-foreground">Drag across the palette to fine-tune it.</p>
													</div>
													<span className="h-8 w-8 shrink-0 rounded-md border border-white/20" style={{ backgroundColor: customHexColor }} />
												</div>
												<HexColorPicker color={customHexColor} onChange={updateCustomColor} className="!h-44 !w-full" />
												<div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-background/60 px-3 py-2">
													<span className="text-xs text-muted-foreground">Hex</span>
													<code className="text-xs font-medium uppercase text-foreground">{customHexColor}</code>
												</div>
											</PopoverContent>
										</Popover>
									</div>
									<div className="flex items-center justify-between rounded-lg border border-white/10 bg-background/45 px-3 py-2">
										<span className="text-xs text-muted-foreground">Selected color</span>
										<div className="flex items-center gap-2">
											<span className="font-mono text-xs text-muted-foreground">{activeColor}</span>
											<span className="h-6 w-6 rounded-full border border-white/25 shadow-[0_0_18px_rgba(255,255,255,.08)]" style={{ backgroundColor: activeColor }} />
										</div>
									</div>
								</div>

								<SettingSlider label="Alpha" value={crosshair.alpha} min={0} max={255} step={1} disabled={!crosshair.alphaEnabled} onChange={(value) => updateNumber('alpha', value)} />

								<div className="grid gap-3 sm:grid-cols-2">
									<SettingToggle label="Center dot" checked={crosshair.centerDotEnabled} onChange={(value) => updateBoolean('centerDotEnabled', value)} />
									<SettingToggle label="Outline" checked={crosshair.outlineEnabled} onChange={(value) => updateBoolean('outlineEnabled', value)} />
									<SettingToggle label="Use alpha" checked={crosshair.alphaEnabled} onChange={(value) => updateBoolean('alphaEnabled', value)} />
									<SettingToggle label="T style" checked={crosshair.tStyleEnabled} onChange={(value) => updateBoolean('tStyleEnabled', value)} />
								</div>
							</div>
						</div>
					</Card>

					<aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
						<Card className="overflow-hidden border-white/10 bg-card/75 p-0 shadow-2xl shadow-black/25 backdrop-blur-xl">
							<div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
								<div>
									<h2 className="text-base font-semibold text-foreground">Live preview</h2>
									<p className="text-sm text-muted-foreground">Color: rgb({previewColor.r}, {previewColor.g}, {previewColor.b})</p>
								</div>
								<div className="h-9 w-9 rounded-full border border-white/20 shadow-[0_0_24px_rgba(255,255,255,.12)]" style={{ backgroundColor: activeColor }} />
							</div>
							<div className="p-4">
								<div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,#d7b886,#8b7355_62%,#3d352c)]">
									<div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_26%,rgba(255,255,255,.26),transparent_15rem),linear-gradient(180deg,rgba(255,255,255,.1),rgba(0,0,0,.18))]" />
									<div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
									<div className="relative h-full w-full">
										<CrosshairShape crosshair={crosshair} />
									</div>
								</div>
							</div>
						</Card>

						<Card className="border-white/10 bg-card/75 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
							<div className="mb-4 flex items-center justify-between gap-3">
								<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
									<TerminalSquare className="h-4 w-4 text-primary" />
									Output
								</div>
								<span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-muted-foreground">CS2 ready</span>
							</div>
							<div className="space-y-3">
								<code className="block break-all rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-foreground">{shareCode}</code>
								<div className="grid gap-2 sm:grid-cols-2">
									<Button onClick={() => handleCopy(shareCode, 'Share code copied')} className="bg-primary text-primary-foreground hover:bg-primary/90">
										<ClipboardCopy className="h-4 w-4" />
										Share Code
									</Button>
									<Button onClick={() => handleCopy(convars.replace(/\n/g, '; '), 'Console command copied')} variant="secondary" className="border border-white/10 bg-white/[0.05]">
										<ClipboardCopy className="h-4 w-4" />
										Command
									</Button>
									<Button asChild variant="outline" className="sm:col-span-2 border-white/10 bg-white/[0.03]">
										<Link to={getShareCodeUrlPath(shareCode)}>
											<ExternalLink className="h-4 w-4" />
											Open in converter
										</Link>
									</Button>
								</div>
								<details className="rounded-lg border border-white/10 bg-background/45">
									<summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground">Show generated convars</summary>
									<pre className="max-h-44 overflow-auto border-t border-white/10 p-3 text-xs text-muted-foreground">{convars}</pre>
								</details>
							</div>
						</Card>
					</aside>
				</section>
			</div>
		</main>
	);
};

export default CustomCrosshair;
