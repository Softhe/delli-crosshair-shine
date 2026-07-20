import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomCrosshair from '@/pages/CustomCrosshair';
import { copyToClipboard } from '@/lib/clipboard';

vi.mock('@/lib/clipboard', () => ({
	copyToClipboard: vi.fn().mockResolvedValue(undefined),
}));

const VALID_CODE = 'CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO';

const LocationProbe = () => {
	const location = useLocation();
	return <output aria-label="current route">{location.pathname}{location.search}</output>;
};

const NavigationControls = () => {
	const navigate = useNavigate();
	return (
		<>
			<button onClick={() => navigate('/?code=invalid')}>Navigate invalid</button>
			<button onClick={() => navigate('/')}>Navigate root</button>
			<button onClick={() => navigate(`/?code=${VALID_CODE}`)}>Navigate valid</button>
		</>
	);
};

const renderStudio = (initialEntry = '/') => render(
	<MemoryRouter initialEntries={[initialEntry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
		<Routes>
			<Route path="*" element={<><CustomCrosshair /><LocationProbe /><NavigationControls /></>} />
		</Routes>
	</MemoryRouter>
);

describe('CS2 Crosshair Studio', () => {
	beforeEach(() => {
		vi.mocked(copyToClipboard).mockClear();
	});

	it('presents import, customization, preview, and export in one workspace', () => {
		renderStudio();
		expect(screen.getByRole('heading', { name: 'CS2 Crosshair Studio' })).toBeInTheDocument();
		expect(screen.getByLabelText('CS2 crosshair share code')).toBeInTheDocument();
		expect(screen.getByRole('slider', { name: 'Length' })).toBeInTheDocument();
		expect(screen.getAllByRole('img', { name: 'Custom crosshair preview' })).toHaveLength(2);
		expect(screen.getByRole('button', { name: 'Copy command' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Download CFG' })).toBeInTheDocument();
		expect(screen.queryByText('Create Custom')).not.toBeInTheDocument();
		expect(screen.queryByText('Open in converter')).not.toBeInTheDocument();
	});

	it('opens the visual color picker and keeps output in the same workspace', async () => {
		const user = userEvent.setup();
		renderStudio();
		await user.click(screen.getByRole('button', { name: 'Custom' }));
		expect(screen.getByText('Choose custom color')).toBeInTheDocument();
		expect(screen.getByText('#00ffff')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
	});

	it('reveals dependent controls only when advanced options require them', async () => {
		const user = userEvent.setup();
		renderStudio();
		expect(screen.queryByRole('slider', { name: 'Outline thickness' })).not.toBeInTheDocument();
		await user.click(screen.getByText('Advanced options'));
		await user.click(screen.getByRole('checkbox', { name: 'Outline' }));
		expect(screen.getByRole('slider', { name: 'Outline thickness' })).toBeInTheDocument();
	});

	it('announces an invalid import without replacing the active output', async () => {
		const user = userEvent.setup();
		renderStudio();
		const input = screen.getByLabelText('CS2 crosshair share code');
		const originalCode = input.getAttribute('value');
		await user.clear(input);
		await user.type(input, 'invalid');
		await user.click(screen.getByRole('button', { name: 'Load crosshair' }));
		expect(screen.getByRole('alert')).toHaveTextContent('Share code must start with');
		expect(screen.getByText(originalCode || '')).toBeInTheDocument();
	});

	it('shows the actual invalid URL value and recovers on later navigation', async () => {
		const user = userEvent.setup();
		renderStudio('/?code=invalid');
		expect(screen.getByLabelText('CS2 crosshair share code')).toHaveValue('invalid');
		expect(screen.getByRole('alert')).toHaveTextContent('Share code must start with');

		await user.click(screen.getByRole('button', { name: 'Navigate root' }));
		await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
		expect((screen.getByLabelText('CS2 crosshair share code') as HTMLInputElement).value).toMatch(/^CSGO-/);

		await user.click(screen.getByRole('button', { name: 'Navigate valid' }));
		await waitFor(() => expect(screen.getByLabelText('CS2 crosshair share code')).toHaveValue(VALID_CODE));
	});

	it('imports a code, updates the URL, and persists it across remounts', async () => {
		const user = userEvent.setup();
		const firstRender = renderStudio();
		const input = screen.getByLabelText('CS2 crosshair share code');
		await user.clear(input);
		await user.type(input, VALID_CODE);
		await user.click(screen.getByRole('button', { name: 'Load crosshair' }));

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(input).toHaveValue(VALID_CODE);
		await waitFor(() => expect(screen.getByLabelText('current route')).toHaveTextContent(`/?code=${VALID_CODE}`));

		firstRender.unmount();
		renderStudio();
		expect(screen.getByLabelText('CS2 crosshair share code')).toHaveValue(VALID_CODE);
	});

	it('gives a URL code precedence and does not restore it after an edit', async () => {
		const user = userEvent.setup();
		localStorage.setItem('cs2_custom_crosshair_draft', 'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA');
		renderStudio(`/?code=${VALID_CODE}`);
		expect(screen.getByLabelText('CS2 crosshair share code')).toHaveValue(VALID_CODE);

		await user.click(screen.getByRole('button', { name: 'Dot' }));
		const editedCode = (screen.getByLabelText('CS2 crosshair share code') as HTMLInputElement).value;
		expect(editedCode).not.toBe(VALID_CODE);
		await waitFor(() => expect(screen.getByLabelText('current route')).toHaveTextContent(`/?code=${editedCode}`));
		expect(screen.getByLabelText('CS2 crosshair share code')).toHaveValue(editedCode);
	});

	it('loads a preset into the editor, output, draft storage, and URL', async () => {
		const user = userEvent.setup();
		renderStudio();
		await user.click(screen.getByRole('button', { name: 'Dot' }));
		const generatedCode = (screen.getByLabelText('CS2 crosshair share code') as HTMLInputElement).value;
		expect(generatedCode).toMatch(/^CSGO-/);
		expect(localStorage.getItem('cs2_custom_crosshair_draft')).toBe(generatedCode);
		expect(screen.getByLabelText('current route')).toHaveTextContent(`/?code=${generatedCode}`);
	});

	it('does not leave URL synchronization pending after a no-op preset action', async () => {
		const user = userEvent.setup();
		renderStudio();
		await user.click(screen.getByRole('button', { name: 'Small static' }));
		await user.click(screen.getByRole('button', { name: 'Small static' }));
		await user.click(screen.getByRole('button', { name: 'Navigate valid' }));
		await waitFor(() => expect(screen.getByLabelText('CS2 crosshair share code')).toHaveValue(VALID_CODE));
	});

	it('reset restores the default route and clears the saved draft', async () => {
		const user = userEvent.setup();
		renderStudio();
		await user.click(screen.getByRole('button', { name: 'Dot' }));
		expect(localStorage.getItem('cs2_custom_crosshair_draft')).toMatch(/^CSGO-/);
		await user.click(screen.getByRole('button', { name: 'Reset' }));
		expect(screen.getByLabelText('current route')).toHaveTextContent(/^\/$/);
		await waitFor(() => expect(localStorage.getItem('cs2_custom_crosshair_draft')).toBeNull());
	});

	it('does not suppress a later default draft after a no-op reset', async () => {
		const user = userEvent.setup();
		renderStudio();
		const defaultCode = (screen.getByLabelText('CS2 crosshair share code') as HTMLInputElement).value;

		await user.click(screen.getByRole('button', { name: 'Reset' }));
		await user.click(screen.getByRole('button', { name: 'Dot' }));
		await user.click(screen.getByRole('button', { name: 'Small static' }));

		await waitFor(() => expect(localStorage.getItem('cs2_custom_crosshair_draft')).toBe(defaultCode));
	});

	it('copies command, code, and share link from the active studio', async () => {
		const user = userEvent.setup();
		renderStudio();
		const code = (screen.getByLabelText('CS2 crosshair share code') as HTMLInputElement).value;

		await user.click(screen.getByRole('button', { name: 'Copy code' }));
		expect(copyToClipboard).toHaveBeenLastCalledWith(code);

		await user.click(screen.getByRole('button', { name: 'Share link' }));
		expect(copyToClipboard).toHaveBeenLastCalledWith(`${window.location.origin}/?code=${code}`);

		await user.click(screen.getByRole('button', { name: 'Copy command' }));
		expect(copyToClipboard).toHaveBeenLastCalledWith(expect.stringContaining('host_writeconfig'));
		expect(await screen.findByRole('tab', { name: 'Recent (1)' })).toBeInTheDocument();
	});

	it('adds generated crosshairs to history and favorites without duplicate load targets', async () => {
		const user = userEvent.setup();
		renderStudio();
		await user.click(screen.getByRole('button', { name: 'Copy command' }));

		const favoriteButton = await screen.findByRole('button', { name: 'Add crosshair to favorites' });
		await user.click(favoriteButton);
		expect(await screen.findByRole('tab', { name: 'Favorites (1)' })).toBeInTheDocument();
		const recentPanel = screen.getByRole('tabpanel', { name: 'Recent (1)' });
		expect(within(recentPanel).getAllByRole('button', { name: 'Load crosshair' })).toHaveLength(1);
	});

	it('downloads the exact filename shown in the alias preview', async () => {
		const user = userEvent.setup();
		let downloadedFileName = '';
		const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
			downloadedFileName = this.download;
		});
		const createObjectURL = vi.fn(() => 'blob:crosshair-config');
		const revokeObjectURL = vi.fn();
		Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
		Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

		renderStudio();
		await user.click(screen.getByText('Optional alias and filename'));
		await user.type(screen.getByLabelText('Alias name'), 'team green');
		expect(screen.getByText('crosshair_team_green.cfg')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Download CFG' }));

		expect(downloadedFileName).toBe('crosshair_team_green.cfg');
		expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:crosshair-config');
		clickSpy.mockRestore();
	});
});
