import { useState } from 'react';
import { MessageSquareText, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackStudioEvent } from '@/lib/observability';

const STORAGE_KEY = 'cs2_studio_feedback';
type FeedbackValue = 'easy' | 'difficult';

const readFeedback = (): FeedbackValue | null => {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return value === 'easy' || value === 'difficult' ? value : null;
	} catch {
		return null;
	}
};

export const StudioFeedback = () => {
	const [feedback, setFeedback] = useState<FeedbackValue | null>(readFeedback);

	const choose = (value: FeedbackValue) => {
		setFeedback(value);
		try { localStorage.setItem(STORAGE_KEY, value); } catch { /* Feedback remains optional. */ }
		trackStudioEvent(value === 'easy' ? 'feedback_easy' : 'feedback_difficult');
	};

	return (
		<section aria-labelledby="feedback-title" className="mx-auto mt-6 flex w-full max-w-7xl flex-col gap-3 rounded-lg border border-white/10 bg-card/55 p-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3">
				<MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
				<div>
					<h2 id="feedback-title" className="text-sm font-semibold text-foreground">Was it easy to create the crosshair you wanted?</h2>
					<p className="text-xs text-muted-foreground">{feedback ? 'Thanks — your answer stays only in this browser.' : 'One tap helps guide the next studio release. Nothing is transmitted.'}</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<Button type="button" size="sm" variant={feedback === 'easy' ? 'default' : 'outline'} aria-pressed={feedback === 'easy'} onClick={() => choose('easy')}><ThumbsUp className="h-4 w-4" />Easy</Button>
				<Button type="button" size="sm" variant={feedback === 'difficult' ? 'default' : 'outline'} aria-pressed={feedback === 'difficult'} onClick={() => choose('difficult')}><ThumbsDown className="h-4 w-4" />Difficult</Button>
			</div>
		</section>
	);
};
