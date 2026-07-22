import {
	crosshairToConVars,
	decodeCrosshairShareCode,
	InvalidCrosshairShareCode,
	InvalidShareCode
} from '@/lib/cs2-sharecode';
import { createAliasCommand } from '@/lib/crosshair-config';

export interface ShareCodeValidationResult {
	valid: boolean;
	error?: string;
}

export const validateShareCode = (code: string): ShareCodeValidationResult => {
	const trimmedCode = code.trim();

	if (!trimmedCode) {
		return { valid: false, error: 'Please enter a share code' };
	}

	if (!trimmedCode.startsWith('CSGO-')) {
		return { valid: false, error: 'Share code must start with "CSGO-"' };
	}

	const parts = trimmedCode.split('-');
	if (parts.length !== 6) {
		return { valid: false, error: 'Invalid format. Expected: CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX' };
	}

	try {
		decodeCrosshairShareCode(trimmedCode);
		return { valid: true };
	} catch {
		return { valid: false, error: 'Unable to decode share code. Please verify it\'s correct.' };
	}
};

export const getCrosshairConVars = (shareCode: string): string => {
	const validation = validateShareCode(shareCode);

	if (!validation.valid) {
		throw new Error(validation.error || 'Invalid crosshair share code format');
	}

	try {
		const crosshair = decodeCrosshairShareCode(shareCode.trim());
		return crosshairToConVars(crosshair);
	} catch (error) {
		if (error instanceof InvalidShareCode || error instanceof InvalidCrosshairShareCode) {
			throw new Error('Invalid crosshair share code format', { cause: error });
		}
		throw error;
	}
};

export const generateConfig = (shareCode: string, fileName: string, aliasName?: string): string => {
	const trimmedShareCode = shareCode.trim();
	const convars = getCrosshairConVars(trimmedShareCode);
	const aliasCommand = createAliasCommand(aliasName, fileName);

	return `// CS2 Crosshair Config - Generated from ${trimmedShareCode}
// Place this file in your CS2 config folder
// Add this to your autoexec.cfg: ${aliasCommand}

// Crosshair settings
${convars}
host_writeconfig

echo "Crosshair config loaded successfully!"`;
};

export const generateConsoleCommand = (shareCode: string): string => {
	const convars = getCrosshairConVars(shareCode);
	const commands = convars
		.split('\n')
		.map((line) => line.trim().replace(/"/g, ''))
		.filter(Boolean);

	return [...commands, 'host_writeconfig'].join('; ');
};
