import { GetSession, GetSubmission, GetRevisions } from '@app/application';
import { match } from 'effect/Either';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { notFound, redirect } from 'next/navigation';
import { RevisionForm } from '@app/presentation/components/internal/author/revisions';

type Props = {
  params: Promise<{ submissionId: string }>;
};

export default async function NewRevisionPage({ params }: Props) {
  const { submissionId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  if (!['AUTHOR'].includes(session.activeRole)) {
    notFound();
  }

  const getSubmission = serverContainer.get<GetSubmission>(SYMBOLS.GetSubmission);
  const getRevisions = serverContainer.get<GetRevisions>(SYMBOLS.GetRevisions);

  const [submissionResult, revisionsResult] = await Promise.all([
    getSubmission.execute(submissionId, ['journal', 'author']),
    getRevisions.execute(undefined, { submissionId }, undefined, { take: 1 }),
  ]);

  const submission = match(submissionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const [revisions] = match(revisionsResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const latestRevision = revisions.length > 0 ? revisions[0] : null;
  const canCreate = !latestRevision || latestRevision.isFrozen;

  if (!canCreate) {
    redirect(`/submissions/${submissionId}/revisions`);
  }

  const nextVersion = latestRevision ? latestRevision.version + 1 : 1;
  const isFirstRevision = !latestRevision;
  const isSubmissionDraft = submission.status === 'DRAFT';

  // When first revision and submission is DRAFT, start at SUBMITTED stage
  const targetStage = isFirstRevision && isSubmissionDraft ? 'SUBMITTED' : submission.status;

  return (
    <RevisionForm
      submissionId={submissionId}
      version={nextVersion}
      startStage={targetStage}
      currentStage={targetStage}
    />
  );
}
