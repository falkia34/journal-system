import { GetIssues, GetRevision, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { IssueDto, IssueMapper } from '@app/infrastructure/dtos';
import { DecisionForm } from '@app/presentation/components/internal/admin';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ submissionId: string; revisionId: string }>;
};

export default async function CreateDecisionPage({ params }: Props) {
  const { submissionId, revisionId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  if (session.activeRole !== 'ADMINISTRATOR') {
    notFound();
  }

  const getRevision = serverContainer.get<GetRevision>(SYMBOLS.GetRevision);
  const revisionResult = await getRevision.execute(revisionId, []);
  const revision = match(revisionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  if (revision.submissionId !== submissionId) {
    notFound();
  }

  const getIssues = serverContainer.get<GetIssues>(SYMBOLS.GetIssues);
  const issuesResult = await getIssues.execute(undefined, undefined, undefined, { take: 100 });
  const [issues] = match(issuesResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return (
    <DecisionForm
      submissionId={submissionId}
      revisionId={revisionId}
      startStage={revision.currentStage}
      issues={issues.map(IssueMapper.fromDomainToDto) as IssueDto[]}
      revisionVersion={revision.version}
    />
  );
}
