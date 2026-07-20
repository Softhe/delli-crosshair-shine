import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Star, Trash2, Download, Copy, Share2, Database, Search, Upload } from 'lucide-react';
import { getHistory, getFavorites, removeFromHistory, toggleFavorite, isFavorited } from '@/lib/storage';
import type { CrosshairData } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { copyToClipboard } from '@/lib/clipboard';
import { getCurrentShareUrl } from '@/lib/share-url';

interface CrosshairHistoryProps {
	onSelectCrosshair: (shareCode: string, aliasName?: string) => void;
}

export const CrosshairHistory = ({ onSelectCrosshair }: CrosshairHistoryProps) => {
	const [history, setHistory] = useState<CrosshairData[]>(getHistory());
	const [favorites, setFavorites] = useState<CrosshairData[]>(getFavorites());
	const { toast } = useToast();

	const refreshData = () => {
		setHistory(getHistory());
		setFavorites(getFavorites());
	};

	const handleDelete = (id: string) => {
		removeFromHistory(id);
		refreshData();
		toast({
			title: "Removed",
			description: "Crosshair removed from history",
		});
	};

	const handleToggleFavorite = (crosshair: CrosshairData) => {
		try {
			const isFav = toggleFavorite({
				shareCode: crosshair.shareCode,
				aliasName: crosshair.aliasName,
				activity: crosshair.activity,
				settings: crosshair.settings,
			});

			refreshData();
			toast({
				title: isFav ? "Added to favorites" : "Removed from favorites",
				description: isFav ? "Crosshair saved to favorites" : "Crosshair removed from favorites",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to update favorites",
				variant: "destructive",
			});
		}
	};

	const handleCopyShareLink = async (shareCode: string) => {
		try {
			await copyToClipboard(getCurrentShareUrl(shareCode));
			toast({
				title: "Share link copied!",
				description: "Anyone opening this link will load this crosshair automatically.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to copy share link. Please copy manually.",
				variant: "destructive",
			});
		}
	};
	const handleCopyShareCode = async (shareCode: string) => {
		try {
			await copyToClipboard(shareCode);
			toast({
				title: "Copied!",
				description: "Share code copied to clipboard",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to copy. Please copy manually.",
				variant: "destructive",
			});
		}
	};

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString();
	};

	const CrosshairItem = ({ item, showDelete = true }: { item: CrosshairData; showDelete?: boolean }) => {
		const isFav = isFavorited(item.shareCode);

		return (
			<div data-testid="history-item" data-activity={item.activity} className="group rounded-lg border border-tactical-blue/20 bg-secondary/30 p-4 transition-all duration-200 hover:border-neon-cyan/30 hover:bg-secondary/50">
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<div className="mb-2 flex flex-wrap items-center gap-2">
							{item.aliasName && (
								<span className="text-sm font-semibold text-neon-cyan">
									{item.aliasName}
								</span>
							)}
							<span className="text-xs text-muted-foreground flex items-center gap-1">
								<Clock className="w-3 h-3" />
								{formatDate(item.timestamp)}
							</span>
							{item.activity && <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{item.activity === 'imported' ? <Search className="h-3 w-3" /> : <Upload className="h-3 w-3" />}{item.activity === 'imported' ? 'Loaded' : 'Exported'}</span>}
						</div>
						<code className="text-xs text-muted-foreground font-mono block truncate">
							{item.shareCode}
						</code>
						{item.settings && (
							<div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
								<span>Style: {item.settings.style}</span>
								<span>•</span>
								<span>Size: {item.settings.length}</span>
								<span>•</span>
								<span>Gap: {item.settings.gap}</span>
							</div>
						)}
					</div>
					<div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
						<Button
							onClick={() => handleToggleFavorite(item)}
							variant="ghost"
							size="icon"
							className="h-10 w-10"
							title={isFav ? "Remove from favorites" : "Add to favorites"}
							aria-label={`${isFav ? "Remove" : "Add"} ${item.aliasName || "crosshair"} ${isFav ? "from" : "to"} favorites`}
						>
							<Star className={`w-4 h-4 ${isFav ? 'fill-yellow-500 text-yellow-500' : ''}`} />
						</Button>
						<Button
							onClick={() => handleCopyShareCode(item.shareCode)}
							variant="ghost"
							size="icon"
							className="h-10 w-10"
							title="Copy share code"
							aria-label={`Copy share code for ${item.aliasName || "crosshair"}`}
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							onClick={() => handleCopyShareLink(item.shareCode)}
							variant="ghost"
							size="icon"
							className="h-10 w-10 text-primary hover:text-primary"
							title="Copy share link"
							aria-label={`Copy share link for ${item.aliasName || "crosshair"}`}
						>
							<Share2 className="w-4 h-4" />
						</Button>
						<Button
							onClick={() => onSelectCrosshair(item.shareCode, item.aliasName)}
							variant="ghost"
							size="icon"
							className="h-10 w-10"
							title="Load crosshair"
							aria-label={`Load ${item.aliasName || "crosshair"}`}
						>
							<Download className="w-4 h-4" />
						</Button>
						{showDelete && (
							<Button
								onClick={() => handleDelete(item.id)}
								variant="ghost"
								size="icon"
								className="h-10 w-10 text-destructive hover:text-destructive"
								title="Remove from history"
								aria-label={`Remove ${item.aliasName || "crosshair"} from history`}
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	};

	return (
		<Card data-testid="local-crosshair-library" className="card-gaming">
			<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary"><Database className="h-4 w-4" /></span>
					<div><h2 className="text-lg font-semibold text-foreground">Local crosshair library</h2><p className="text-sm text-muted-foreground">Codes you load or export are saved only in this browser.</p></div>
				</div>
				<span className="w-fit rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">On this device</span>
			</div>
			<Tabs defaultValue="recent" className="w-full">
				<TabsList className="mb-4 grid h-11 w-full grid-cols-2 p-0">
					<TabsTrigger value="recent" className="flex h-full items-center gap-2">
						<Clock className="w-4 h-4" />
						Recent ({history.length})
					</TabsTrigger>
					<TabsTrigger value="favorites" className="flex h-full items-center gap-2">
						<Star className="w-4 h-4" />
						Favorites ({favorites.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="recent" className="mt-0">
					{history.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
							<p>No recent crosshairs</p>
							<p className="text-sm mt-1">Load a share code or export your current crosshair to save it here.</p>
						</div>
					) : (
						<ScrollArea className="h-[400px] pr-4">
							<div className="space-y-3">
								{history.map((item) => (
									<CrosshairItem key={item.id} item={item} />
								))}
							</div>
						</ScrollArea>
					)}
				</TabsContent>

				<TabsContent value="favorites" className="mt-0">
					{favorites.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
							<p>No favorite crosshairs yet</p>
							<p className="text-sm mt-1">Click the star icon to save your favorites</p>
						</div>
					) : (
						<ScrollArea className="h-[400px] pr-4">
							<div className="space-y-3">
								{favorites.map((item) => (
									<CrosshairItem key={item.id} item={item} showDelete={false} />
								))}
							</div>
						</ScrollArea>
					)}
				</TabsContent>
			</Tabs>
		</Card>
	);
};
