import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CS2ConfigGenerator } from '@/components/CS2ConfigGenerator';
import { getHistory } from '@/lib/storage';

const VALID_CODE = 'CSGO-wAD3c-ykt5L-zvZ98-vBisR-6sWPA';

const LocationProbe = () => {
	const location = useLocation();
	return <output aria-label="current route">{location.pathname}{location.search}</output>;
};

const renderGenerator = (initialEntry = '/') => render(
	<MemoryRouter initialEntries={[initialEntry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
		<Routes>
			<Route path="*" element={<><CS2ConfigGenerator /><LocationProbe /></>} />
		</Routes>
	</MemoryRouter>
);

afterEach(() => {
	vi.restoreAllMocks();
});

describe('CS2ConfigGenerator browser flows', () => {
	it('loads a share-code route and enables all valid-code actions', async () => {
		renderGenerator(`/${VALID_CODE}`);

		expect(screen.getByLabelText('Share code')).toHaveValue(VALID_CODE);
		await waitFor(() => expect(screen.getByRole('button', { name: 'Copy Command' })).toBeEnabled());
		expect(screen.getByRole('button', { name: 'Share Link' })).toBeEnabled();
		expect(screen.getByRole('button', { name: 'Download CFG' })).toBeEnabled();
		expect(screen.getByText(`${window.location.origin}/?code=${VALID_CODE}`)).toBeInTheDocument();
	});

	it('loads a deterministic Example, updates the route, and rejects invalid input', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);
		const user = userEvent.setup();
		renderGenerator();

		await user.click(screen.getByRole('button', { name: 'Example' }));
		expect(screen.getByLabelText('Share code')).toHaveValue(VALID_CODE);
		await waitFor(() => expect(screen.getByLabelText('current route')).toHaveTextContent(`/?code=${VALID_CODE}`));
		await waitFor(() => expect(screen.getByRole('button', { name: 'Copy Command' })).toBeEnabled());

		await user.clear(screen.getByLabelText('Share code'));
		await user.type(screen.getByLabelText('Share code'), 'CSGO-bad');
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid format'));
		expect(screen.getByRole('button', { name: 'Copy Command' })).toBeDisabled();
	});

	it('copies the generated command and persists the crosshair in recent history', async () => {
		const user = userEvent.setup();
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText },
		});
		renderGenerator(`/${VALID_CODE}`);

		await waitFor(() => expect(screen.getByRole('button', { name: 'Copy Command' })).toBeEnabled());
		await user.type(screen.getByLabelText('Alias name'), 'team green');
		await user.click(screen.getByRole('button', { name: 'Copy Command' }));

		await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
		expect(writeText.mock.calls[0][0]).toContain('cl_crosshairgap -4');
		expect(writeText.mock.calls[0][0]).toMatch(/; host_writeconfig$/);
		expect(getHistory()).toEqual([
			expect.objectContaining({ shareCode: VALID_CODE, aliasName: 'team green' }),
		]);
		expect(screen.getByText('Recent (1)')).toBeInTheDocument();
	});
});
