import { GetFeedback, GetRevision, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { FeedbackDto, FeedbackMapper } from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { FeedbackView, FeedbackForm } from '@app/presentation/components/internal/shared/feedbacks';

type Props = {
  params: Promise<{ submissionId: string; revisionId: string; feedbackId: string }>;
};

export default async function SingleFeedbackPage({ params }: Props) {
  const { submissionId, revisionId, feedbackId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  if (feedbackId === 'new' && ['EDITOR', 'REVIEWER'].includes(session.activeRole)) {
    const getRevision = serverContainer.get<GetRevision>(SYMBOLS.GetRevision);
    const revisionResult = await getRevision.execute(revisionId, []);
    const revision = match(revisionResult, {
      onLeft: (error) => {
        throw error;
      },
      onRight: (data) => data,
    });

    return (
      <FeedbackForm
        submissionId={submissionId}
        revisionId={revisionId}
        stage={revision.currentStage}
        authorId={session.user.id}
      />
    );
  } else {
    const getFeedback = serverContainer.get<GetFeedback>(SYMBOLS.GetFeedback);
    const feedbackResult = await getFeedback.execute(feedbackId, [
      'submission',
      'revision',
      'author',
    ]);
    const feedback = match(feedbackResult, {
      onLeft: (error) => {
        throw error;
      },
      onRight: (data) => data,
    });

    return (
      <>
        <SectionHeader title="Feedback" />
        <FeedbackView initialFeedback={FeedbackMapper.fromDomainToDto(feedback) as FeedbackDto} />
      </>
    );
  }
}
