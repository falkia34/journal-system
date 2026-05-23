import { GetIssues, GetSession } from '@app/application';
import {
  IssueDto,
  IssueMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { IssuesList, IssuesToolbar } from '@app/presentation/components/internal/admin/issues';
import { match } from 'effect/Either';
import { notFound } from 'next/navigation';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';

export const dynamic = 'force-dynamic';

export default async function IssuesPage() {
  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  if (session.activeRole === 'ADMINISTRATOR') {
    const getIssues = serverContainer.get<GetIssues>(SYMBOLS.GetIssues);
    const result = await getIssues.execute(['journal'], undefined, undefined, { take: 25 });
    const [issues, paginationOptions] = match(result, {
      onLeft: (error) => {
        throw error;
      },
      onRight: (data) => data,
    });

    return (
      <>
        <SectionHeader title="Issues">
          <IssuesToolbar />
        </SectionHeader>
        <IssuesList
          initialIssues={issues.map(IssueMapper.fromDomainToDto) as IssueDto[]}
          initialPaginationOptions={
            PaginationOptionsMapper.fromDomainToDto(paginationOptions) as PaginationOptionsDto
          }
        />
      </>
    );
  } else {
    notFound();
  }
}
