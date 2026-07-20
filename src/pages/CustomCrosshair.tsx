import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	AlertCircle,
	Check,
	ClipboardCopy,
	ClipboardPaste,
	Crosshair as CrosshairIcon,
	Download,
	Palette,
	Pipette,
	RotateCcw,
	Share2,
	TerminalSquare,
	Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomCrosshairPreview } from '@/components/CustomCrosshairPreview';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/clipboard';
import {
	crosshairToConVars,
	decodeCrosshairShareCode,
	encodeCrosshair,
	type Crosshair
} from '@/lib/cs2-sharecode';
import { clampCrosshair } from '@/lib/crosshair-preview';
import { clearCustomCrosshair, loadCustomCrosshair, saveCustomCrosshair } from '@/lib/custom-crosshair-storage';
import { createAliasCommand, createConfigFileName } from '@/lib/crosshair-config';
import { generateConfig, generateConsoleCommand, validateShareCode } from '@/lib/crosshair-output';
import { getCurrentShareUrl, getShareCodeFromUrl, getShareCodeUrlPath } from '@/lib/share-url';
import { addToHistory, type CrosshairHistoryActivity } from '@/lib/storage';
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

const HexColorPicker = lazy(() => import('react-colorful').then(({ HexColorPicker: Component }) => ({ default: Component })));
const CrosshairHistory = lazy(() => import('@/components/CrosshairHistory').then(({ CrosshairHistory: Component }) => ({ default: Component })));

const DOT_CROSSHAIR_CODE = 'CSGO-zDZH2-jXXvr-yFaQu-OjXPS-G8sdA';
const PALETTE_STORAGE_KEY = 'cs2_studio_palette';

type StudioPalette = 'tactical' | 'cs2' | 'crimson';

const PALETTE_OPTIONS: Array<{ name: string; value: StudioPalette; colors: [string, string]; description: string }> = [
	{ name: 'Tactical', value: 'tactical', colors: ['#1dbd9f', '#25bfe1'], description: 'Deep petrol surfaces with teal and sea-glass highlights.' },
	{ name: 'CS2', value: 'cs2', colors: ['#e88632', '#6f91a8'], description: 'Counter-Strike-inspired gunmetal, warm orange, sand, and steel blue.' },
	{ name: 'Crimson', value: 'crimson', colors: ['#943b58', '#c18a95'], description: 'Calm wine red with dusty rose highlights on deep merlot surfaces.' }
];

const getStoredPalette = (): StudioPalette => {
	try {
		const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
		return PALETTE_OPTIONS.some(({ value }) => value === stored) ? stored as StudioPalette : 'tactical';
	} catch {
		return 'tactical';
	}
};

const useDesktopStudioLayout = () => {
	const query = '(min-width: 1280px)';
	const [matches, setMatches] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches);

	useEffect(() => {
		if (typeof window.matchMedia !== 'function') return;
		const media = window.matchMedia(query);
		const updateMatches = (event: MediaQueryListEvent | MediaQueryList) => setMatches(event.matches);
		updateMatches(media);
		media.addEventListener('change', updateMatches);
		return () => media.removeEventListener('change', updateMatches);
	}, []);

	return matches;
};

const COLOR_OPTIONS = [
	{ label: 'Red', value: 0, swatch: 'rgb(255, 0, 0)' },
	{ label: 'Green', value: 1, swatch: 'rgb(0, 255, 0)' },
	{ label: 'Yellow', value: 2, swatch: 'rgb(255, 255, 0)' },
	{ label: 'Blue', value: 3, swatch: 'rgb(0, 0, 255)' },
	{ label: 'Cyan', value: 4, swatch: 'rgb(0, 255, 255)' }
];

const PRESETS: Array<{ name: string; description: string; crosshair: Crosshair }> = [
	{ name: 'Small static', description: 'Compact cyan crosshair with a slight negative gap.', crosshair: DEFAULT_CROSSHAIR },
	{
		name: 'Dot', description: 'Outlined cyan dot with a tight gap and full alpha.',
		crosshair: decodeCrosshairShareCode(DOT_CROSSHAIR_CODE)
	},
	{
		name: 'High visibility', description: 'Larger yellow arms for busy backgrounds.',
		crosshair: { ...DEFAULT_CROSSHAIR, length: 3.5, gap: -1, thickness: 1.5, outlineEnabled: true, outline: 1, color: 2 }
	},
	{
		name: 'Classic green', description: 'Traditional green static style with center dot.',
		crosshair: { ...DEFAULT_CROSSHAIR, length: 2.5, gap: -3, thickness: 1, centerDotEnabled: true, color: 1 }
	}
];

type NumberKey = { [K in keyof Crosshair]: Crosshair[K] extends number ? K : never }[keyof Crosshair];
type BooleanKey = { [K in keyof Crosshair]: Crosshair[K] extends boolean ? K : never }[keyof Crosshair];

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
	<div data-setting-slider={label} className={disabled ? 'space-y-2 opacity-45' : 'space-y-2'}>
		<div className="flex items-center justify-between gap-3">
			<span className="text-sm font-medium text-foreground">{label}</span>
			<span className="rounded border border-white/10 bg-background/70 px-2 py-1 font-mono text-xs text-muted-foreground">{value.toFixed(step < 1 ? 1 : 0)}</span>
		</div>
		<Slider thumbLabel={label} value={[value]} min={min} max={max} step={step} disabled={disabled} onValueChange={([next]) => onChange(next)} />
	</div>
);

const SettingToggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
	<label className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${checked ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-white/10 bg-background/45 text-muted-foreground hover:bg-white/[0.05]'}`}>
		<span>{label}</span>
		<Checkbox checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
	</label>
);

const getInitialCrosshair = (pathname: string, search: string): Crosshair => {
	const urlCode = getShareCodeFromUrl({ pathname, search });
	if (validateShareCode(urlCode).valid) return decodeCrosshairShareCode(urlCode);
	return loadCustomCrosshair(DEFAULT_CROSSHAIR);
};

const CustomCrosshair = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const initialUrlCode = getShareCodeFromUrl(location);
	const [crosshair, setCrosshair] = useState<Crosshair>(() => getInitialCrosshair(location.pathname, location.search));
	const [importCode, setImportCode] = useState(() => initialUrlCode || encodeCrosshair(getInitialCrosshair(location.pathname, location.search)));
	const [importError, setImportError] = useState(() => initialUrlCode && !validateShareCode(initialUrlCode).valid ? validateShareCode(initialUrlCode).error || '' : '');
	const [aliasName, setAliasName] = useState('');
	const [customColorOpen, setCustomColorOpen] = useState(false);
	const [palette, setPalette] = useState<StudioPalette>(getStoredPalette);
	const [historyKey, setHistoryKey] = useState(0);
	const desktopStudioLayout = useDesktopStudioLayout();
	const suppressedDraftCode = useRef<string | null>(null);
	const pendingUrlCode = useRef<string | undefined>(undefined);
	const lastExternalHistoryCode = useRef<string | null>(null);
	const { toast } = useToast();

	const shareCode = useMemo(() => encodeCrosshair(crosshair), [crosshair]);
	const convars = useMemo(() => crosshairToConVars(crosshair), [crosshair]);
	const customHexColor = rgbToHex(crosshair.red, crosshair.green, crosshair.blue);
	const trimmedAliasName = aliasName.trim();
	const [defaultFileName] = useState(() => createConfigFileName());
	const previewFileName = useMemo(() => trimmedAliasName ? createConfigFileName(trimmedAliasName) : defaultFileName, [defaultFileName, trimmedAliasName]);
	const previewAliasCommand = useMemo(() => createAliasCommand(trimmedAliasName || undefined, previewFileName), [trimmedAliasName, previewFileName]);

	const recordCrosshairHistory = useCallback((nextCrosshair: Crosshair, activity: CrosshairHistoryActivity, nextAliasName?: string) => {
		const normalized = clampCrosshair(nextCrosshair);
		addToHistory({
			shareCode: encodeCrosshair(normalized),
			aliasName: nextAliasName?.trim() || undefined,
			activity,
			settings: {
				style: normalized.style,
				length: normalized.length,
				thickness: normalized.thickness,
				gap: normalized.gap,
				outline: normalized.outline,
				outlineEnabled: normalized.outlineEnabled,
				centerDotEnabled: normalized.centerDotEnabled,
				color: normalized.color,
				alpha: normalized.alpha,
				alphaEnabled: normalized.alphaEnabled
			}
		});
		setHistoryKey((current) => current + 1);
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		root.dataset.palette = palette;
		try {
			localStorage.setItem(PALETTE_STORAGE_KEY, palette);
		} catch {
			// The selected palette still applies when storage is unavailable.
		}
		return () => {
			delete root.dataset.palette;
		};
	}, [palette]);

	useEffect(() => {
		if (suppressedDraftCode.current === shareCode) {
			suppressedDraftCode.current = null;
			clearCustomCrosshair();
			return;
		}
		saveCustomCrosshair(crosshair);
	}, [crosshair, shareCode]);

	useEffect(() => {
		const urlCode = getShareCodeFromUrl({ pathname: location.pathname, search: location.search });
		if (pendingUrlCode.current !== undefined) {
			if (urlCode === pendingUrlCode.current) {
				pendingUrlCode.current = undefined;
			}
			return;
		}
		if (!urlCode) {
			setImportCode(shareCode);
			setImportError('');
			return;
		}
		const validation = validateShareCode(urlCode);
		if (!validation.valid) {
			setImportCode(urlCode);
			setImportError(validation.error || 'Enter a valid CS2 crosshair share code.');
			return;
		}
		const decoded = decodeCrosshairShareCode(urlCode);
		if (lastExternalHistoryCode.current !== urlCode) {
			lastExternalHistoryCode.current = urlCode;
			recordCrosshairHistory(decoded, 'imported');
		}
		if (urlCode === shareCode) {
			setImportCode(urlCode);
			setImportError('');
			return;
		}
		setCrosshair(decoded);
		setImportCode(urlCode);
		setImportError('');
	}, [location.pathname, location.search, recordCrosshairHistory, shareCode]);

	const applyCrosshair = useCallback((nextCrosshair: Crosshair) => {
		const next = clampCrosshair(nextCrosshair);
		const nextCode = encodeCrosshair(next);
		setCrosshair(next);
		setImportCode(nextCode);
		setImportError('');
		pendingUrlCode.current = getShareCodeFromUrl(location) === nextCode ? undefined : nextCode;
		navigate(getShareCodeUrlPath(nextCode), { replace: true });
	}, [location, navigate]);

	const updateNumber = (key: NumberKey, value: number) => applyCrosshair({ ...crosshair, [key]: value });
	const updateBoolean = (key: BooleanKey, value: boolean) => applyCrosshair({ ...crosshair, [key]: value });
	const updateCustomColor = (hex: string) => {
		const rgb = hexToRgb(hex);
		if (rgb) applyCrosshair({ ...crosshair, color: 5, ...rgb });
	};

	const addCurrentToHistory = useCallback(() => recordCrosshairHistory(crosshair, 'exported', trimmedAliasName), [crosshair, recordCrosshairHistory, trimmedAliasName]);

	const handleImport = useCallback(() => {
		const validation = validateShareCode(importCode);
		if (!validation.valid) {
			setImportError(validation.error || 'Enter a valid CS2 crosshair share code.');
			toast({ title: 'Import failed', description: validation.error, variant: 'destructive' });
			return;
		}
		const decoded = decodeCrosshairShareCode(importCode.trim());
		lastExternalHistoryCode.current = encodeCrosshair(decoded);
		applyCrosshair(decoded);
		recordCrosshairHistory(decoded, 'imported');
		toast({ title: 'Crosshair loaded', description: 'The editor and preview now use this share code.' });
	}, [applyCrosshair, importCode, recordCrosshairHistory, toast]);

	const handlePaste = async () => {
		let clipboardValue = '';
		try {
			if (!navigator.clipboard?.readText) throw new Error('Clipboard reading is not available in this browser.');
			clipboardValue = (await navigator.clipboard.readText()).trim();
			const validation = validateShareCode(clipboardValue);
			if (!validation.valid) throw new Error(validation.error);
			setImportCode(clipboardValue);
			const decoded = decodeCrosshairShareCode(clipboardValue);
			lastExternalHistoryCode.current = encodeCrosshair(decoded);
			applyCrosshair(decoded);
			recordCrosshairHistory(decoded, 'imported');
			toast({ title: 'Crosshair pasted', description: 'Ready to tune.' });
		} catch (error) {
			const description = error instanceof Error ? error.message : 'Unable to read the clipboard.';
			if (clipboardValue) setImportCode(clipboardValue);
			setImportError(description);
			toast({ title: 'Paste failed', description, variant: 'destructive' });
		}
	};

	const handleReset = () => {
		const defaultCode = encodeCrosshair(DEFAULT_CROSSHAIR);
		clearCustomCrosshair();
		suppressedDraftCode.current = shareCode === defaultCode ? null : defaultCode;
		setCrosshair({ ...DEFAULT_CROSSHAIR });
		setImportCode(defaultCode);
		setImportError('');
		setAliasName('');
		setCustomColorOpen(false);
		pendingUrlCode.current = getShareCodeFromUrl(location) ? '' : undefined;
		navigate('/', { replace: true });
	};

	const handleCopy = async (value: string, title: string, track = false) => {
		try {
			await copyToClipboard(value);
			if (track) addCurrentToHistory();
			toast({ title, description: 'Copied to clipboard.' });
		} catch {
			toast({ title: 'Copy failed', description: 'Unable to write to clipboard.', variant: 'destructive' });
		}
	};

	const handleDownload = () => {
		const fileName = previewFileName;
		const blob = new Blob([generateConfig(shareCode, fileName, trimmedAliasName || undefined)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = fileName;
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(url);
		addCurrentToHistory();
		toast({ title: 'CFG downloaded', description: `${fileName} is ready for your CS2 config folder.` });
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
				event.preventDefault();
				void handleCopy(generateConsoleCommand(shareCode), 'Console command copied', true);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});

	const handleHistorySelect = (code: string, alias?: string) => {
		applyCrosshair(decodeCrosshairShareCode(code));
		setAliasName(alias || '');
		toast({ title: 'Crosshair loaded', description: 'Loaded from your saved crosshairs.' });
	};

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-3 md:gap-4">
			<header>
				<div className="space-y-1.5 md:space-y-2">
					<div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
						<CrosshairIcon className="h-3.5 w-3.5" /> One workspace
					</div>
					<h1 className="text-4xl font-semibold leading-tight tracking-normal text-foreground md:text-5xl">CS2 Crosshair Studio</h1>
					<p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg xl:leading-normal">Shift-Tab, paste a crosshair you spotted in your match, tune it, then download a ready-to-use CFG.</p>
				</div>
			</header>

			<Card data-testid="control-center" className="overflow-hidden border-white/10 bg-card/75 p-0 shadow-2xl shadow-black/25 backdrop-blur-xl">
					<div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
						<div><h2 className="text-lg font-semibold text-foreground">Studio workspace</h2><p className="text-sm text-muted-foreground">Every editor tool, preview, and export action in one compact surface.</p></div>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
							<fieldset className="min-w-0" aria-label="Visual palette">
								<legend className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Palette className="h-3.5 w-3.5" />Palette</legend>
								<div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-background/45 p-1">
									{PALETTE_OPTIONS.map((option) => <button key={option.value} type="button" aria-pressed={palette === option.value} title={option.description} onClick={() => setPalette(option.value)} className={`flex min-h-9 items-center justify-center gap-2 rounded-md px-2.5 text-xs font-semibold transition-all ${palette === option.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'}`}><span className="flex -space-x-1" aria-hidden="true"><span className="h-3 w-3 rounded-full border border-background" style={{ backgroundColor: option.colors[0] }} /><span className="h-3 w-3 rounded-full border border-background" style={{ backgroundColor: option.colors[1] }} /></span>{option.name}</button>)}
								</div>
							</fieldset>
							<Button onClick={handleReset} variant="outline" className="h-10 shrink-0 border-white/10 bg-white/[0.04]"><RotateCcw className="h-4 w-4" /> Reset</Button>
						</div>
					</div>

					<div data-testid="editor-layout" className="grid items-start xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
						<div data-testid="editor-left-stack" className="divide-y divide-white/10 xl:self-start xl:border-r xl:border-white/10">
						<section data-testid="import-controls" className="space-y-4 p-5 md:p-6">
							<div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">1</span><div><h3 className="text-base font-semibold text-foreground">Import</h3><p className="text-sm text-muted-foreground">Paste a share code or start from a preset.</p></div></div>
							<div className="flex flex-col gap-2 sm:flex-row">
								<div className="relative min-w-0 flex-1">
									<Input aria-label="CS2 crosshair share code" aria-invalid={Boolean(importError)} aria-describedby={importError ? 'import-code-error' : undefined} value={importCode} onChange={(event) => { setImportCode(event.target.value); setImportError(''); }} className="h-12 border-white/10 bg-background/70 pr-11 font-mono text-sm" />
									{!importError && validateShareCode(importCode).valid && <Check className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-success" />}
								</div>
								<Button onClick={handlePaste} variant="secondary" className="h-12 shrink-0 border border-white/10 bg-white/[0.05]"><ClipboardPaste className="h-4 w-4" /> Paste</Button>
								<Button onClick={handleImport} className="h-12 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">Load crosshair</Button>
							</div>
							{importError && <div id="import-code-error" role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{importError}</div>}
							<div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Presets</span>{PRESETS.map((preset) => <button key={preset.name} onClick={() => applyCrosshair(preset.crosshair)} title={preset.description} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10">{preset.name}</button>)}</div>
						</section>

						<section data-testid="customize-controls" className="space-y-6 p-5 md:p-6">
							<div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">2</span><div><h3 className="text-base font-semibold text-foreground">Customize</h3><p className="text-sm text-muted-foreground">Every change updates the preview and output instantly.</p></div></div><Wand2 className="mt-1 h-5 w-5 shrink-0 text-primary" /></div>
							<div className="grid gap-6 lg:grid-cols-2">
								<div data-testid="slider-stack" className="space-y-5">
									<h4 className="text-sm font-semibold text-foreground">Shape</h4>
									<SettingSlider label="Length" value={crosshair.length} min={0} max={10} step={0.5} onChange={(value) => updateNumber('length', value)} />
									<SettingSlider label="Thickness" value={crosshair.thickness} min={0.5} max={6} step={0.5} onChange={(value) => updateNumber('thickness', value)} />
									<SettingSlider label="Gap" value={crosshair.gap} min={-10} max={10} step={0.5} onChange={(value) => updateNumber('gap', value)} />
									<SettingSlider label="Outline thickness" value={crosshair.outline} min={0} max={3} step={0.5} disabled={!crosshair.outlineEnabled} onChange={(value) => updateNumber('outline', value)} />
									<SettingSlider label="Alpha" value={crosshair.alpha} min={0} max={255} step={1} disabled={!crosshair.alphaEnabled} onChange={(value) => updateNumber('alpha', value)} />
								</div>
								<div className="space-y-5">
									<div className="space-y-3"><h4 className="text-sm font-semibold text-foreground">Color</h4><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{COLOR_OPTIONS.map((option) => <button key={option.value} type="button" aria-pressed={crosshair.color === option.value} onClick={() => updateNumber('color', option.value)} className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${crosshair.color === option.value ? 'border-primary bg-primary/15 text-foreground' : 'border-white/10 bg-background/45 text-muted-foreground hover:bg-white/[0.06]'}`}><span className="h-4 w-4 rounded-full border border-white/25" style={{ background: option.swatch }} />{option.label}{crosshair.color === option.value && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}</button>)}<Popover open={customColorOpen} onOpenChange={setCustomColorOpen}><PopoverTrigger asChild><button type="button" aria-pressed={crosshair.color === 5} onClick={() => updateNumber('color', 5)} className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${crosshair.color === 5 ? 'border-primary bg-primary/15 text-foreground' : 'border-white/10 bg-background/45 text-muted-foreground hover:bg-white/[0.06]'}`}><span className="h-4 w-4 rounded-full border border-white/25" style={{ backgroundColor: customHexColor }} />Custom{crosshair.color === 5 ? <Check className="ml-auto h-3.5 w-3.5 text-primary" /> : <Pipette className="ml-auto h-3.5 w-3.5" />}</button></PopoverTrigger><PopoverContent align="end" className="w-72 border-white/10 bg-popover/95 p-4 shadow-2xl backdrop-blur-xl"><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-foreground">Choose custom color</h3><p className="text-xs text-muted-foreground">Drag across the palette to fine-tune it.</p></div><span className="h-8 w-8 rounded-md border border-white/20" style={{ backgroundColor: customHexColor }} /></div><Suspense fallback={<div className="h-44 w-full animate-pulse rounded-lg bg-white/[0.05]" aria-label="Loading color picker" />}><HexColorPicker color={customHexColor} onChange={updateCustomColor} className="!h-44 !w-full" /></Suspense><div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-background/60 px-3 py-2"><span className="text-xs text-muted-foreground">Hex</span><code className="text-xs font-medium uppercase text-foreground">{customHexColor}</code></div></PopoverContent></Popover></div></div>
									<div className="space-y-3"><h4 className="text-sm font-semibold text-foreground">Visibility</h4><div className="grid gap-2 sm:grid-cols-2"><SettingToggle label="Center dot" checked={crosshair.centerDotEnabled} onChange={(value) => updateBoolean('centerDotEnabled', value)} /><SettingToggle label="Outline" checked={crosshair.outlineEnabled} onChange={(value) => updateBoolean('outlineEnabled', value)} /><SettingToggle label="Use alpha" checked={crosshair.alphaEnabled} onChange={(value) => updateBoolean('alphaEnabled', value)} /><SettingToggle label="T style" checked={crosshair.tStyleEnabled} onChange={(value) => updateBoolean('tStyleEnabled', value)} /></div></div>
								</div>
							</div>
						</section>
						{desktopStudioLayout && <div className="p-4 md:p-5"><Suspense fallback={<div className="h-32 animate-pulse rounded-lg border border-white/10 bg-card/30" aria-label="Loading saved crosshairs" />}><CrosshairHistory key={historyKey} onSelectCrosshair={handleHistorySelect} /></Suspense></div>}
						</div>

						<div data-testid="editor-right-stack" className="divide-y divide-white/10 border-t border-white/10 xl:self-start xl:border-t-0">
							<aside data-testid="preview-workspace" className="bg-background/20">
								<CustomCrosshairPreview crosshair={crosshair} embedded />
							</aside>
						<section data-testid="export-controls" className="space-y-4 p-5 md:p-6">
							<div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">3</span><div><h3 className="text-base font-semibold text-foreground">Save & switch</h3><p className="text-sm text-muted-foreground">Download the CFG and keep an alias ready for your next match.</p></div></div><span className="shrink-0 rounded-full border border-success/25 bg-success/10 px-2 py-1 text-xs text-success">CS2 ready</span></div>
							<code className="block break-all rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-foreground">{shareCode}</code>
							<div className="grid gap-2 sm:grid-cols-2"><Button onClick={() => handleCopy(generateConsoleCommand(shareCode), 'Console command copied', true)} className="bg-primary text-primary-foreground hover:bg-primary/90"><ClipboardCopy className="h-4 w-4" />Copy command</Button><Button onClick={handleDownload} variant="outline" className="border-accent/40 bg-accent/10 text-foreground hover:bg-accent/15"><Download className="h-4 w-4" />Download CFG</Button><Button onClick={() => handleCopy(shareCode, 'Share code copied', true)} variant="secondary" className="border border-white/10 bg-white/[0.05]"><ClipboardCopy className="h-4 w-4" />Copy code</Button><Button onClick={() => handleCopy(getCurrentShareUrl(shareCode), 'Share link copied', true)} variant="secondary" className="border border-white/10 bg-white/[0.05]"><Share2 className="h-4 w-4" />Share link</Button></div>
							<div className="space-y-3 rounded-lg border border-white/10 bg-background/35 p-4"><div className="flex items-center gap-2"><TerminalSquare className="h-4 w-4 text-primary" /><h4 className="text-sm font-semibold text-foreground">CFG & autoexec shortcut</h4></div><p className="text-xs text-muted-foreground">Name the file, download it to your CS2 cfg folder, then copy the alias into autoexec.cfg.</p><label htmlFor="aliasName" className="text-sm font-medium text-foreground">Alias name <span aria-hidden="true" className="font-normal text-muted-foreground">(optional)</span></label><Input id="aliasName" value={aliasName} onChange={(event) => setAliasName(event.target.value)} placeholder="team green" className="border-white/10 bg-background/70 font-mono" /><div className="space-y-1 text-xs text-muted-foreground"><p>File: <code className="text-foreground">{previewFileName}</code></p>{trimmedAliasName && <p>Autoexec alias: <code className="break-all text-foreground">{previewAliasCommand}</code></p>}</div>{trimmedAliasName && <Button onClick={() => handleCopy(previewAliasCommand, 'Alias command copied', true)} variant="ghost" size="sm" className="w-full"><ClipboardCopy className="h-4 w-4" />Copy autoexec alias</Button>}</div>
							<details className="rounded-lg border border-white/10 bg-background/45"><summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground">Show generated convars</summary><pre className="max-h-44 overflow-auto border-t border-white/10 p-3 text-xs text-muted-foreground">{convars}</pre></details>
							<p className="text-xs text-muted-foreground">Tip: Ctrl + Enter copies the command.</p>
						</section>
						</div>
					</div>
			</Card>

			{!desktopStudioLayout && <Suspense fallback={<div className="h-32 animate-pulse rounded-lg border border-white/10 bg-card/30" aria-label="Loading saved crosshairs" />}><CrosshairHistory key={historyKey} onSelectCrosshair={handleHistorySelect} /></Suspense>}
		</div>
	);
};

export default CustomCrosshair;
