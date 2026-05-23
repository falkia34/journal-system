import { GetJournal, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { JournalDto, JournalMapper } from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import {
  JournalForm,
  JournalToolbar,
  JournalView,
} from '@app/presentation/components/internal/admin/journals';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ journalId: string }>;
};

export default async function SingleJournalPage({ params }: Props) {
  const { journalId } = await params;

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

  if (journalId === 'new') {
    return <JournalForm />;
  }

  const getJournal = serverContainer.get<GetJournal>(SYMBOLS.GetJournal);
  const journalResult = await getJournal.execute(journalId, ['editorInChief']);
  const journal = match(journalResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return (
    <>
      <SectionHeader title={journal.name}>
        <JournalToolbar journalId={journal.id} />
      </SectionHeader>
      <JournalView initialJournal={JournalMapper.fromDomainToDto(journal) as JournalDto} />
    </>
  );
}
