import { GetFeedback, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { FeedbackDto, FeedbackMapper } from '@app/infrastructure/dtos';
import { FeedbackForm } from '@app/presentation/components/internal/shared/feedbacks';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ submissionId: string; revisionId: string; feedbackId: string }>;
};

export default async function EditFeedbackPage({ params }: Props) {
  const { submissionId, revisionId, feedbackId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  if (!['EDITOR', 'REVIEWER'].includes(session.activeRole)) {
    notFound();
  }

  const getFeedback = serverContainer.get<GetFeedback>(SYMBOLS.GetFeedback);
  const feedbackResult = await getFeedback.execute(feedbackId, [
    'submission',
    'revision',
    'author',
  ]);
  const feedback = match(feedbackResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  return (
    <FeedbackForm
      initialFeedback={FeedbackMapper.fromDomainToDto(feedback) as FeedbackDto}
      submissionId={submissionId}
      revisionId={revisionId}
      stage={feedback.stage}
      authorId={session.user.id}
    />
  );
}
