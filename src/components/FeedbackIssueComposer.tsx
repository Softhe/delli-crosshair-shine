import { useMemo, useState } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildFeedbackIssueUrl, createFeedbackPayload, formatFeedbackIssueBody, type FeedbackRating } from '@/lib/feedback';
import { getObservabilitySnapshot } from '@/lib/observability';

interface FeedbackIssueComposerProps {
	rating: FeedbackRating;
}

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.0.0';

export const FeedbackIssueComposer = ({ rating }: FeedbackIssueComposerProps) => {
	const [notes, setNotes] = useState('');
	const [reviewing, setReviewing] = useState(false);
	const payload = useMemo(
		() => createFeedbackPayload(rating, notes, getObservabilitySnapshot(), APP_VERSION),
		[rating, notes],
	);
	const body = formatFeedbackIssueBody(payload);

	if (!reviewing) {
		return (
			<div className="flex flex-col gap-2 sm:items-end">
				<label className="w-full text-xs text-muted-foreground sm:w-72">
					Optional note
					<textarea
						value={notes}
						maxLength={1200}
						onChange={(event) => setNotes(event.target.value)}
						placeholder="What worked, or what got in your way?"
						className="mt-1 min-h-20 w-full resize-y rounded-md border border-white/10 bg-background/70 px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
				</label>
				<Button type="button" size="sm" variant="outline" onClick={() => setReviewing(true)}>
					<ShieldCheck className="h-4 w-4" />Review GitHub issue
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full space-y-3">
			<div className="rounded-md border border-white/10 bg-background/70 p-3">
				<p className="mb-2 text-xs font-semibold text-foreground">Exactly what will be shared</p>
				<pre data-testid="feedback-issue-preview" className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">{body}</pre>
			</div>
			<div className="flex flex-wrap justify-end gap-2">
				<Button type="button" size="sm" variant="ghost" onClick={() => setReviewing(false)}>Edit note</Button>
				<Button asChild size="sm">
					<a href={buildFeedbackIssueUrl(payload)} target="_blank" rel="noreferrer">
						<ExternalLink className="h-4 w-4" />Open GitHub issue
					</a>
				</Button>
			</div>
		</div>
	);
};
