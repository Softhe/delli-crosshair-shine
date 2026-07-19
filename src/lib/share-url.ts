export const decodeUrlShareCode = (value: string | null): string => {
	if (!value) {
		return '';
	}

	try {
		return decodeURIComponent(value).trim();
	} catch {
		return value.trim();
	}
};

export const getShareCodeFromUrl = (location: { pathname: string; search: string }): string => {
	const params = new URLSearchParams(location.search);
	const queryCode = params.get('code') || params.get('crosshair');

	if (queryCode) {
		return decodeUrlShareCode(queryCode);
	}

	const pathCode = location.pathname.split('/').filter(Boolean)[0];
	return decodeUrlShareCode(pathCode || null);
};

/**
 * Share links live on the site's real root document so static hosts return a
 * successful status instead of serving their 404 fallback. Legacy
 * `/CSGO-...` links remain readable via getShareCodeFromUrl.
 */
export const getShareCodeUrlPath = (code: string): string => `/?code=${encodeURIComponent(code.trim())}`;

export const getShareUrl = (code: string, origin: string): string => `${origin}${getShareCodeUrlPath(code)}`;

export const getCurrentShareUrl = (code: string): string => {
	if (typeof window === 'undefined') {
		return getShareCodeUrlPath(code);
	}

	return getShareUrl(code, window.location.origin);
};
