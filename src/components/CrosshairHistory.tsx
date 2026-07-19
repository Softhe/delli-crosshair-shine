import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Star, Trash2, Download, Copy, Share2 } from 'lucide-react';
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
			<div className="group relative bg-secondary/30 border border-tactical-blue/20 rounded-lg p-4 hover:bg-secondary/50 hover:border-neon-cyan/30 transition-all duration-200">
				<div className="relative z-10 flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2">
							{item.aliasName && (
								<span className="text-sm font-semibold text-neon-cyan">
									{item.aliasName}
								</span>
							)}
							<span className="text-xs text-muted-foreground flex items-center gap-1">
								<Clock className="w-3 h-3" />
								{formatDate(item.timestamp)}
							</span>
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
					<div className="relative z-20 flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
						<Button
							onClick={() => handleToggleFavorite(item)}
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							title={isFav ? "Remove from favorites" : "Add to favorites"}
							aria-label={`${isFav ? "Remove" : "Add"} ${item.aliasName || "crosshair"} ${isFav ? "from" : "to"} favorites`}
						>
							<Star className={`w-4 h-4 ${isFav ? 'fill-yellow-500 text-yellow-500' : ''}`} />
						</Button>
						<Button
							onClick={() => handleCopyShareCode(item.shareCode)}
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							title="Copy share code"
							aria-label={`Copy share code for ${item.aliasName || "crosshair"}`}
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							onClick={() => handleCopyShareLink(item.shareCode)}
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-primary hover:text-primary"
							title="Copy share link"
							aria-label={`Copy share link for ${item.aliasName || "crosshair"}`}
						>
							<Share2 className="w-4 h-4" />
						</Button>
						<Button
							onClick={() => onSelectCrosshair(item.shareCode, item.aliasName)}
							variant="ghost"
							size="icon"
							className="h-8 w-8"
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
								className="h-8 w-8 text-destructive hover:text-destructive"
								title="Remove from history"
								aria-label={`Remove ${item.aliasName || "crosshair"} from history`}
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						)}
					</div>
				</div>
				<Button
					onClick={() => onSelectCrosshair(item.shareCode, item.aliasName)}
					variant="ghost"
					className="absolute inset-0 z-0 h-full w-full opacity-0"
					aria-label={`Load ${item.aliasName || "crosshair"}`}
				/>
			</div>
		);
	};

	if (history.length === 0 && favorites.length === 0) {
		return null;
	}

	return (
		<Card className="card-gaming animate-[slide-in-up_0.5s_ease-out_0.15s_both]">
			<Tabs defaultValue="recent" className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-4">
					<TabsTrigger value="recent" className="flex items-center gap-2">
						<Clock className="w-4 h-4" />
						Recent ({history.length})
					</TabsTrigger>
					<TabsTrigger value="favorites" className="flex items-center gap-2">
						<Star className="w-4 h-4" />
						Favorites ({favorites.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="recent" className="mt-0">
					{history.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
							<p>No recent crosshairs</p>
							<p className="text-sm mt-1">Your generated crosshairs will appear here</p>
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
