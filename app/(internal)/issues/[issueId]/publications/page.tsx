import { GetPublications, GetIssue, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { PublicationDto, PublicationMapper } from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { PublicationsList } from '@app/presentation/components/internal/admin/publications';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ issueId: string }>;
};

export const dynamic = 'force-dynamic';

export default async function PublicationsPage({ params }: Props) {
  const { issueId } = await params;

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

  const getIssue = serverContainer.get<GetIssue>(SYMBOLS.GetIssue);
  const getPublications = serverContainer.get<GetPublications>(SYMBOLS.GetPublications);

  const [issueResult, publicationsResult] = await Promise.all([
    getIssue.execute(issueId, ['journal']),
    getPublications.execute(['submission', 'revision'], { issueId }, undefined, { take: 25 }),
  ]);

  const issue = match(issueResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });
  const [publications] = match(publicationsResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return (
    <>
      <SectionHeader title={`Publications \u2014 Vol. ${issue.volume} No. ${issue.number}`} />
      <PublicationsList
        initialPublications={
          publications.map(PublicationMapper.fromDomainToDto) as PublicationDto[]
        }
      />
    </>
  );
}
