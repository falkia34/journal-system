import { GetSubmissions, GetSession } from '@app/application';
import { match } from 'effect/Either';
import {
  SubmissionDto,
  SubmissionMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { SubmissionsList as AdminSubmissionsList } from '@app/presentation/components/internal/admin/submissions';
import { SubmissionsList as EditorSubmissionsList } from '@app/presentation/components/internal/editor/submissions';
import { SubmissionsList as ReviewerSubmissionsList } from '@app/presentation/components/internal/reviewer/submissions';
import {
  SubmissionsList as AuthorSubmissionsList,
  SubmissionsToolbar as AuthorSubmissionsToolbar,
} from '@app/presentation/components/internal/author/submissions';

export const dynamic = 'force-dynamic';

type Role = 'ADMINISTRATOR' | 'EDITOR' | 'REVIEWER' | 'AUTHOR';

const SUBMISSION_COMPONENTS: Record<
  Role,
  { List: typeof AdminSubmissionsList; Toolbar: React.ComponentType | null }
> = {
  ADMINISTRATOR: { List: AdminSubmissionsList, Toolbar: null },
  EDITOR: { List: EditorSubmissionsList, Toolbar: null },
  REVIEWER: { List: ReviewerSubmissionsList, Toolbar: null },
  AUTHOR: { List: AuthorSubmissionsList, Toolbar: AuthorSubmissionsToolbar },
};

const SUBMISSION_TITLES: Record<Role, string> = {
  ADMINISTRATOR: 'Submissions',
  EDITOR: 'Submissions',
  REVIEWER: 'My Assignments',
  AUTHOR: 'My Submissions',
};

export default async function SubmissionsPage() {
  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  const role = session.activeRole as Role;
  const include: ('author' | 'journal' | 'participants')[] = [
    'ADMINISTRATOR',
    'EDITOR',
    'REVIEWER',
  ].includes(role)
    ? ['author', 'journal', 'participants']
    : ['journal'];

  const getSubmissions = serverContainer.get<GetSubmissions>(SYMBOLS.GetSubmissions);
  const result = await getSubmissions.execute(include, undefined, undefined, { take: 25 });
  const [submissions, paginationOptions] = match(result, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  const { List, Toolbar } = SUBMISSION_COMPONENTS[role];

  return (
    <>
      <SectionHeader title={SUBMISSION_TITLES[role]}>{Toolbar ? <Toolbar /> : null}</SectionHeader>
      <List
        initialSubmissions={submissions.map(SubmissionMapper.fromDomainToDto) as SubmissionDto[]}
        initialPaginationOptions={
          PaginationOptionsMapper.fromDomainToDto(paginationOptions) as PaginationOptionsDto
        }
      />
    </>
  );
}
