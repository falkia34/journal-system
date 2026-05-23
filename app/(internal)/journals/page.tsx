import { GetJournals, GetSession } from '@app/application';
import { match } from 'effect/Either';
import {
  JournalDto,
  JournalMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import {
  JournalsList,
  JournalsToolbar,
} from '@app/presentation/components/internal/admin/journals';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function JournalsPage() {
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

  const getJournals = serverContainer.get<GetJournals>(SYMBOLS.GetJournals);
  const result = await getJournals.execute(['editorInChief'], undefined, undefined, { take: 25 });
  const [journals, paginationOptions] = match(result, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return (
    <>
      <SectionHeader title="Journals">
        <JournalsToolbar />
      </SectionHeader>
      <JournalsList
        initialJournals={journals.map(JournalMapper.fromDomainToDto) as JournalDto[]}
        initialPaginationOptions={
          PaginationOptionsMapper.fromDomainToDto(paginationOptions) as PaginationOptionsDto
        }
      />
    </>
  );
}
