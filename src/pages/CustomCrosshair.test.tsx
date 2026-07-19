import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CustomCrosshair from '@/pages/CustomCrosshair';

const VALID_CODE = 'CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO';

const renderBuilder = () => render(
	<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
		<CustomCrosshair />
	</MemoryRouter>
);

describe('CustomCrosshair', () => {
	it('exposes named sliders without numeric RGB inputs', () => {
		renderBuilder();
		expect(screen.getByRole('slider', { name: 'Length' })).toBeInTheDocument();
		expect(screen.getByRole('slider', { name: 'Thickness' })).toBeInTheDocument();
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
	});

	it('opens a visual color picker when Custom is selected', async () => {
		const user = userEvent.setup();
		renderBuilder();
		await user.click(screen.getByRole('button', { name: 'Custom' }));
		expect(screen.getByText('Choose custom color')).toBeInTheDocument();
		expect(screen.getByText('#00ffff')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Open in converter' })).toHaveAttribute('href', expect.stringMatching(/^\/\?code=CSGO-/));
	});

	it('announces invalid imports', async () => {
		const user = userEvent.setup();
		renderBuilder();
		await user.type(screen.getByLabelText('CS2 crosshair share code'), 'invalid');
		await user.click(screen.getByRole('button', { name: 'Import' }));
		expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid CS2 crosshair share code.');
	});

	it('imports a valid share code, exports the same code, and persists it across remounts', async () => {
		const user = userEvent.setup();
		const firstRender = renderBuilder();
		await user.type(screen.getByLabelText('CS2 crosshair share code'), VALID_CODE);
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(screen.getByText(VALID_CODE)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Open in converter' })).toHaveAttribute('href', `/?code=${VALID_CODE}`);

		firstRender.unmount();
		renderBuilder();
		expect(screen.getByText(VALID_CODE)).toBeInTheDocument();
	});
});
