import { GetSession, GetRevision } from '@app/application';
import { match } from 'effect/Either';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { notFound } from 'next/navigation';
import { RevisionForm } from '@app/presentation/components/internal/author/revisions';
import { RevisionMapper, RevisionDto } from '@app/infrastructure/dtos';

type Props = {
  params: Promise<{ submissionId: string; revisionId: string }>;
};

export default async function EditRevisionPage({ params }: Props) {
  const { submissionId, revisionId } = await params;
  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  if (!['AUTHOR', 'ADMINISTRATOR'].includes(session.activeRole)) {
    notFound();
  }

  const getRevision = serverContainer.get<GetRevision>(SYMBOLS.GetRevision);
  const revisionResult = await getRevision.execute(revisionId);
  const revision = match(revisionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  return (
    <RevisionForm
      submissionId={submissionId}
      initialRevision={RevisionMapper.fromDomainToDto(revision) as RevisionDto}
    />
  );
}
