import { lazy, Suspense } from 'react';
import { CS2ConfigGenerator } from '@/components/CS2ConfigGenerator';

const FAQ = lazy(() => import('@/components/FAQ').then(({ FAQ: Component }) => ({ default: Component })));

const Index = () => {
	return (
		<main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<CS2ConfigGenerator />
			<section className="mx-auto mt-8 w-full max-w-7xl">
				<Suspense fallback={<div className="h-40 rounded-lg border border-white/10 bg-card/30" aria-hidden="true" />}>
					<FAQ />
				</Suspense>
			</section>
		</main>
	);
};

export default Index;
