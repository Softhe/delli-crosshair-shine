import { lazy, Suspense } from 'react';
import CustomCrosshair from '@/pages/CustomCrosshair';

const FAQ = lazy(() => import('@/components/FAQ').then(({ FAQ: Component }) => ({ default: Component })));
const StudioFeedback = lazy(() => import('@/components/StudioFeedback').then(({ StudioFeedback: Component }) => ({ default: Component })));

const Index = () => {
	return (
		<main className="min-h-screen px-4 pb-24 pt-3 sm:px-6 md:pb-6 md:pt-6 lg:px-8">
			<CustomCrosshair />
			<section className="mx-auto mt-6 w-full max-w-7xl min-[1600px]:max-w-[1680px]">
				<Suspense fallback={<div className="h-40 rounded-lg border border-white/10 bg-card/30" aria-hidden="true" />}>
					<FAQ />
				</Suspense>
			</section>
			<Suspense fallback={null}><StudioFeedback /></Suspense>
		</main>
	);
};

export default Index;
