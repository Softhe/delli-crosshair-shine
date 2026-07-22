import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches);

	useEffect(() => {
		if (typeof window.matchMedia !== 'function') return;
		const media = window.matchMedia(query);
		const updateMatches = (event: MediaQueryListEvent | MediaQueryList) => setMatches(event.matches);
		updateMatches(media);
		media.addEventListener('change', updateMatches);
		return () => media.removeEventListener('change', updateMatches);
	}, [query]);

	return matches;
};
