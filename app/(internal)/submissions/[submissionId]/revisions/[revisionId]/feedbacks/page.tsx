import { GetFeedbacks, GetRevision, GetSession, GetParticipants } from '@app/application';
import { match } from 'effect/Either';
import {
  FeedbackDto,
  FeedbackMapper,
  ParticipantDto,
  ParticipantMapper,
  RevisionDto,
  RevisionMapper,
} from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import {
  FeedbacksList,
  FeedbacksToolbar,
} from '@app/presentation/components/internal/shared/feedbacks';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';

type Props = {
  params: Promise<{ submissionId: string; revisionId: string }>;
};

export const dynamic = 'force-dynamic';

export default async function FeedbacksPage({ params }: Props) {
  const { submissionId, revisionId } = await params;
  const getRevision = serverContainer.get<GetRevision>(SYMBOLS.GetRevision);
  const getFeedbacks = serverContainer.get<GetFeedbacks>(SYMBOLS.GetFeedbacks);
  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const getParticipants = serverContainer.get<GetParticipants>(SYMBOLS.GetParticipants);

  const [sessionResult, revisionResult, feedbacksResult, participantsResult] = await Promise.all([
    getSession.execute(),
    getRevision.execute(revisionId, ['submission']),
    getFeedbacks.execute(undefined, { submissionId, revisionId }, undefined, { take: 25 }),
    getParticipants.execute(['user'], { submissionId }, undefined, { take: 25 }),
  ]);

  const session = match(sessionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const revision = match(revisionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });
  const [feedbacks] = match(feedbacksResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });
  const [participants] = match(participantsResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const userParticipantStages = participants
    .filter((p) => p.userId === session.user.id)
    .map((p) => p.stage);

  return (
    <>
      <SectionHeader title={`Feedback — Revision v${revision.version}`}>
        <FeedbacksToolbar
          submissionId={submissionId}
          revisionId={revisionId}
          revision={RevisionMapper.fromDomainToDto(revision) as RevisionDto}
          participants={participants.map(ParticipantMapper.fromDomainToDto) as ParticipantDto[]}
          currentUserId={session.user.id}
          role={session.activeRole}
        />
      </SectionHeader>
      <FeedbacksList
        submissionId={submissionId}
        revisionId={revisionId}
        feedbacks={feedbacks.map(FeedbackMapper.fromDomainToDto) as FeedbackDto[]}
        currentUserId={session.user.id}
        userParticipantStages={userParticipantStages}
        revisionCurrentStage={revision.currentStage}
      />
    </>
  );
}
