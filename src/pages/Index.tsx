import { CS2ConfigGenerator } from '@/components/CS2ConfigGenerator';
import { FAQ } from '@/components/FAQ';

const Index = () => {
	return (
		<main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<CS2ConfigGenerator />
			<section className="mx-auto mt-8 w-full max-w-7xl">
				<FAQ />
			</section>
		</main>
	);
};

export default Index;