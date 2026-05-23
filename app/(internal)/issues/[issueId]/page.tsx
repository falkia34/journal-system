import { GetIssue, GetJournals, GetSession } from '@app/application';
import { IssueDto, IssueMapper, JournalDto, JournalMapper } from '@app/infrastructure/dtos';
import {
  IssueForm,
  IssueToolbar,
  IssueView,
} from '@app/presentation/components/internal/admin/issues';
import { match } from 'effect/Either';
import { notFound } from 'next/navigation';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';

type Props = {
  params: Promise<{ issueId: string }>;
};

export default async function SingleIssuePage({ params }: Props) {
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
    if (issueId === 'new') {
      const getJournals = serverContainer.get<GetJournals>(SYMBOLS.GetJournals);
      const journalsResult = await getJournals.execute(['editorInChief'], undefined, undefined, {
        take: 100,
      });
      const [journals] = match(journalsResult, {
        onLeft: (error) => {
          throw error;
        },
        onRight: (data) => data,
      });

      return <IssueForm journals={journals.map(JournalMapper.fromDomainToDto) as JournalDto[]} />;
    } else {
      const getIssue = serverContainer.get<GetIssue>(SYMBOLS.GetIssue);
      const issueResult = await getIssue.execute(issueId, ['journal', 'publications']);
      const issue = match(issueResult, {
        onLeft: (error) => {
          throw error;
        },
        onRight: (data) => data,
      });

      return (
        <>
          <SectionHeader
            title={`${issue.journal?.name ? issue.journal.name + ' ' : ''}Issue Vol. ${issue.volume} No. ${issue.number}`}
          >
            <IssueToolbar issueId={issue.id} />
          </SectionHeader>
          <IssueView initialIssue={IssueMapper.fromDomainToDto(issue) as IssueDto} />
        </>
      );
    }
  } else {
    notFound();
  }
}
