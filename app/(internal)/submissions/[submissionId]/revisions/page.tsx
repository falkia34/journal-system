import { GetSubmission, GetRevisions, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { PaginationOptionsMapper, RevisionDto, RevisionMapper } from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { RevisionsList } from '@app/presentation/components/internal/shared/revisions';
import { RevisionsToolbar as AuthorRevisionsToolbar } from '@app/presentation/components/internal/author/revisions';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';

type Role = 'ADMINISTRATOR' | 'EDITOR' | 'REVIEWER' | 'AUTHOR';

const REVISIONS_COMPONENTS: Record<
  Role,
  { List: typeof RevisionsList; Toolbar: React.ComponentType<{ submissionId: string }> | null }
> = {
  ADMINISTRATOR: { List: RevisionsList, Toolbar: null },
  EDITOR: { List: RevisionsList, Toolbar: null },
  REVIEWER: { List: RevisionsList, Toolbar: null },
  AUTHOR: { List: RevisionsList, Toolbar: AuthorRevisionsToolbar },
};

type Props = {
  params: Promise<{ submissionId: string }>;
};

export const dynamic = 'force-dynamic';

export default async function RevisionsPage({ params }: Props) {
  const { submissionId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const role = session.activeRole as Role;

  const getSubmission = serverContainer.get<GetSubmission>(SYMBOLS.GetSubmission);
  const getRevisions = serverContainer.get<GetRevisions>(SYMBOLS.GetRevisions);

  const [submissionResult, revisionsResult] = await Promise.all([
    getSubmission.execute(submissionId, ['author', 'journal']),
    getRevisions.execute(undefined, { submissionId }, undefined, { take: 25 }),
  ]);

  const submission = match(submissionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });
  const [revisions, paginationOptions] = match(revisionsResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const { List, Toolbar } = REVISIONS_COMPONENTS[role];

  return (
    <>
      <SectionHeader title={`Revisions — ${submission.title}`}>
        {Toolbar ? <Toolbar submissionId={submissionId} /> : null}
      </SectionHeader>
      <List
        submissionId={submissionId}
        initialRevisions={revisions.map(RevisionMapper.fromDomainToDto) as RevisionDto[]}
        initialPaginationOptions={PaginationOptionsMapper.fromDomainToDto(paginationOptions)}
      />
    </>
  );
}
