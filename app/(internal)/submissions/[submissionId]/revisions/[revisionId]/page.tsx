import { GetRevision, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { RevisionDto, RevisionMapper } from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { RevisionToolbar } from '@app/presentation/components/internal/author/revisions';
import { RevisionView } from '@app/presentation/components/internal/shared/revisions';

type Props = {
  params: Promise<{ submissionId: string; revisionId: string }>;
};

export default async function SingleRevisionPage({ params }: Props) {
  const { submissionId, revisionId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  const getRevision = serverContainer.get<GetRevision>(SYMBOLS.GetRevision);
  const revisionResult = await getRevision.execute(revisionId, [
    'submission',
    'feedbacks',
    'decisions',
  ]);
  const revision = match(revisionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const revisionDto = RevisionMapper.fromDomainToDto(revision) as RevisionDto;

  return (
    <>
      <SectionHeader title={`Revision v${revision.version}`}>
        <RevisionToolbar
          role={session.activeRole}
          revision={revisionDto}
          submissionId={submissionId}
        />
      </SectionHeader>
      <RevisionView
        initialRevision={revisionDto}
        role={session.activeRole}
        submissionId={submissionId}
      />
    </>
  );
}
