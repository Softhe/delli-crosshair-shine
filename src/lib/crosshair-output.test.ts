import { describe, expect, it } from 'vitest';
import { generateConfig, generateConsoleCommand, validateShareCode } from '@/lib/crosshair-output';

const VALID_CODE = 'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA';

describe('crosshair output', () => {
	it('validates empty, malformed, and valid share codes', () => {
		expect(validateShareCode('')).toEqual({ valid: false, error: 'Please enter a share code' });
		expect(validateShareCode('wAD3c')).toMatchObject({ valid: false });
		expect(validateShareCode('CSGO-aaaaa-bbbbb')).toMatchObject({ valid: false });
		expect(validateShareCode(VALID_CODE)).toEqual({ valid: true });
	});

	it('generates a single-line console command', () => {
		const command = generateConsoleCommand(VALID_CODE);
		expect(command).toContain('cl_crosshairstyle');
		expect(command).toMatch(/; host_writeconfig$/);
		expect(command).not.toContain('\n');
	});

	it('generates a config with a sanitized alias handoff', () => {
		const config = generateConfig(VALID_CODE, 'crosshair_og_small.cfg', 'og small');
		expect(config).toContain('alias "og_small" "exec crosshair_og_small.cfg"');
		expect(config).toContain('host_writeconfig');
	});
});
