import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FirstRunGuide } from '@/components/studio/FirstRunGuide';

describe('FirstRunGuide', () => {
	it('exposes compact steps and lazy expanded help', async () => {
		const user = userEvent.setup();
		render(<FirstRunGuide onDismiss={vi.fn()} />);
		expect(screen.getByLabelText('Getting started steps')).toHaveTextContent('Import→Tune→Save');
		const help = screen.getByRole('button', { name: 'Getting started help' });
		expect(help).toHaveAttribute('aria-expanded', 'false');
		await user.click(help);
		expect(help).toHaveAttribute('aria-expanded', 'true');
		expect(await screen.findByText(/paste a code or choose a preset/i)).toBeInTheDocument();
	});

	it('calls the dismiss action from a keyboard-accessible control', async () => {
		const user = userEvent.setup();
		const onDismiss = vi.fn();
		render(<FirstRunGuide onDismiss={onDismiss} />);
		const buttons = screen.getAllByRole('button', { name: 'Dismiss getting started guide' });
		buttons[0].focus();
		await user.keyboard('{Enter}');
		expect(onDismiss).toHaveBeenCalledOnce();
	});
});
