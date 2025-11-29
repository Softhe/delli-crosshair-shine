// Storage utility for managing crosshair history and favorites

export interface CrosshairData {
	id: string;
	shareCode: string;
	aliasName?: string;
	timestamp: number;
	isFavorite?: boolean;
	settings?: {
		style: number;
		length: number;
		thickness: number;
		gap: number;
		outline: number;
		outlineEnabled: boolean;
		centerDotEnabled: boolean;
		color: number;
		alpha: number;
		alphaEnabled: boolean;
	};
}

const STORAGE_KEYS = {
	HISTORY: 'cs2_crosshair_history',
	FAVORITES: 'cs2_crosshair_favorites',
	SETTINGS: 'cs2_crosshair_settings',
} as const;

const MAX_HISTORY_ITEMS = 20;
const MAX_FAVORITE_ITEMS = 50;

// Generate unique ID for crosshair
export const generateCrosshairId = (shareCode: string): string => {
	return `${shareCode}_${Date.now()}`;
};

// Get all history items
export const getHistory = (): CrosshairData[] => {
	try {
		const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error('Error reading history:', error);
		return [];
	}
};

// Add item to history
export const addToHistory = (crosshair: Omit<CrosshairData, 'id' | 'timestamp'>): void => {
	try {
		const history = getHistory();

		// Check if share code already exists in history
		const existingIndex = history.findIndex(item => item.shareCode === crosshair.shareCode);

		const newItem: CrosshairData = {
			...crosshair,
			id: generateCrosshairId(crosshair.shareCode),
			timestamp: Date.now(),
		};

		// Remove existing entry if found
		if (existingIndex !== -1) {
			history.splice(existingIndex, 1);
		}

		// Add to beginning of array
		history.unshift(newItem);

		// Keep only the most recent items
		const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

		localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
	} catch (error) {
		console.error('Error adding to history:', error);
	}
};

// Remove item from history
export const removeFromHistory = (id: string): void => {
	try {
		const history = getHistory();
		const filtered = history.filter(item => item.id !== id);
		localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
	} catch (error) {
		console.error('Error removing from history:', error);
	}
};

// Clear all history
export const clearHistory = (): void => {
	try {
		localStorage.removeItem(STORAGE_KEYS.HISTORY);
	} catch (error) {
		console.error('Error clearing history:', error);
	}
};

// Get all favorites
export const getFavorites = (): CrosshairData[] => {
	try {
		const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error('Error reading favorites:', error);
		return [];
	}
};

// Add item to favorites
export const addToFavorites = (crosshair: Omit<CrosshairData, 'id' | 'timestamp' | 'isFavorite'>): boolean => {
	try {
		const favorites = getFavorites();

		// Check if already exists
		if (favorites.some(item => item.shareCode === crosshair.shareCode)) {
			return false;
		}

		// Check if limit reached
		if (favorites.length >= MAX_FAVORITE_ITEMS) {
			throw new Error(`Maximum of ${MAX_FAVORITE_ITEMS} favorites reached`);
		}

		const newItem: CrosshairData = {
			...crosshair,
			id: generateCrosshairId(crosshair.shareCode),
			timestamp: Date.now(),
			isFavorite: true,
		};

		favorites.unshift(newItem);
		localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
		return true;
	} catch (error) {
		console.error('Error adding to favorites:', error);
		throw error;
	}
};

// Remove item from favorites
export const removeFromFavorites = (shareCode: string): void => {
	try {
		const favorites = getFavorites();
		const filtered = favorites.filter(item => item.shareCode !== shareCode);
		localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
	} catch (error) {
		console.error('Error removing from favorites:', error);
	}
};

// Check if crosshair is favorited
export const isFavorited = (shareCode: string): boolean => {
	try {
		const favorites = getFavorites();
		return favorites.some(item => item.shareCode === shareCode);
	} catch (error) {
		console.error('Error checking favorite status:', error);
		return false;
	}
};

// Toggle favorite status
export const toggleFavorite = (crosshair: Omit<CrosshairData, 'id' | 'timestamp' | 'isFavorite'>): boolean => {
	const favorited = isFavorited(crosshair.shareCode);

	if (favorited) {
		removeFromFavorites(crosshair.shareCode);
		return false;
	} else {
		addToFavorites(crosshair);
		return true;
	}
};

// Clear all favorites
export const clearFavorites = (): void => {
	try {
		localStorage.removeItem(STORAGE_KEYS.FAVORITES);
	} catch (error) {
		console.error('Error clearing favorites:', error);
	}
};

// Export all data
export const exportAllData = (): string => {
	const history = getHistory();
	const favorites = getFavorites();

	const exportData = {
		version: '1.0',
		exportDate: new Date().toISOString(),
		history,
		favorites,
	};

	return JSON.stringify(exportData, null, 2);
};

// Import data
export const importAllData = (jsonString: string): { success: boolean; error?: string } => {
	try {
		const data = JSON.parse(jsonString);

		// Validate data structure
		if (!data.version || !Array.isArray(data.history) || !Array.isArray(data.favorites)) {
			return { success: false, error: 'Invalid data format' };
		}

		// Import history
		localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));

		// Import favorites
		localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));

		return { success: true };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
};

// Get user settings
export const getUserSettings = (): Record<string, any> => {
	try {
		const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
		return data ? JSON.parse(data) : {};
	} catch (error) {
		console.error('Error reading settings:', error);
		return {};
	}
};

// Save user settings
export const saveUserSettings = (settings: Record<string, any>): void => {
	try {
		const currentSettings = getUserSettings();
		const updatedSettings = { ...currentSettings, ...settings };
		localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
	} catch (error) {
		console.error('Error saving settings:', error);
	}
};

// Get storage usage stats
export const getStorageStats = (): { history: number; favorites: number; total: number } => {
	const history = getHistory();
	const favorites = getFavorites();

	return {
		history: history.length,
		favorites: favorites.length,
		total: history.length + favorites.length,
	};
};
