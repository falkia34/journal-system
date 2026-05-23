import { GetIssue, GetJournals, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { IssueDto, IssueMapper, JournalDto, JournalMapper } from '@app/infrastructure/dtos';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { IssueForm } from '@app/presentation/components/internal/admin/issues';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ issueId: string }>;
};

export default async function EditIssuePage({ params }: Props) {
  const { issueId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  if (session.activeRole === 'ADMINISTRATOR') {
    const getIssue = serverContainer.get<GetIssue>(SYMBOLS.GetIssue);
    const getJournals = serverContainer.get<GetJournals>(SYMBOLS.GetJournals);

    const [issueResult, journalsResult] = await Promise.all([
      getIssue.execute(issueId, ['journal', 'publications']),
      getJournals.execute(['editorInChief'], undefined, undefined, { take: 100 }),
    ]);

    const issue = match(issueResult, {
      onLeft: (error) => {
        throw error;
      },
      onRight: (data) => data,
    });
    const [journals] = match(journalsResult, {
      onLeft: (error) => {
        throw error;
      },
      onRight: (data) => data,
    });

    return (
      <IssueForm
        initialIssue={IssueMapper.fromDomainToDto(issue) as IssueDto}
        journals={journals.map(JournalMapper.fromDomainToDto) as JournalDto[]}
      />
    );
  } else {
    notFound();
  }
}
