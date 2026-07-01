export const getSanitizedFileNameSegment = (value: string): string => {
	return value.trim().replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
};

export const getSafeAliasCommandName = (value: string, fallback = 'mycrosshair'): string => {
	const sanitizedAliasName = value.trim().replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
	return sanitizedAliasName || fallback;
};

export const createConfigFileName = (aliasName?: string, randomNumber = Math.floor(10000 + Math.random() * 90000)): string => {
	const sanitizedAliasName = aliasName ? getSanitizedFileNameSegment(aliasName) : '';

	if (sanitizedAliasName) {
		return `crosshair_${sanitizedAliasName}.cfg`;
	}

	return `crosshair_${randomNumber}.cfg`;
};

export const createAliasCommand = (aliasName: string | undefined, fileName: string): string => {
	return `alias "${getSafeAliasCommandName(aliasName || '')}" "exec ${fileName}"`;
};