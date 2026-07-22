import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackStudioEvent } from '@/lib/observability';

interface AppErrorBoundaryProps {
	children: ReactNode;
}

interface AppErrorBoundaryState {
	hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
	state: AppErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): AppErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		trackStudioEvent('app_error');
		console.error('Unhandled application error', error, info);
	}

	render() {
		if (!this.state.hasError) return this.props.children;

		return (
			<main className="flex min-h-screen items-center justify-center px-4">
				<section role="alert" className="w-full max-w-md rounded-lg border border-destructive/30 bg-card p-6 text-center shadow-xl">
					<AlertTriangle className="mx-auto h-8 w-8 text-destructive" aria-hidden="true" />
					<h1 className="mt-4 text-xl font-semibold">The app could not continue</h1>
					<p className="mt-2 text-sm text-muted-foreground">Reload the page to restore the last saved crosshair draft.</p>
					<Button className="mt-5" onClick={() => window.location.reload()}>
						<RotateCcw className="h-4 w-4" />
						Reload
					</Button>
				</section>
			</main>
		);
	}
}
