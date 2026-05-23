import { GetParticipants, GetSubmission, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { ParticipantDto, ParticipantMapper } from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import {
  ParticipantsList,
  ParticipantsToolbar,
} from '@app/presentation/components/internal/admin/participants';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ submissionId: string }>;
};

export const dynamic = 'force-dynamic';

export default async function ParticipantsPage({ params }: Props) {
  const { submissionId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  if (!['ADMINISTRATOR', 'EDITOR'].includes(session.activeRole)) {
    notFound();
  }

  const getSubmission = serverContainer.get<GetSubmission>(SYMBOLS.GetSubmission);
  const getParticipants = serverContainer.get<GetParticipants>(SYMBOLS.GetParticipants);

  const [submissionResult, participantsResult] = await Promise.all([
    getSubmission.execute(submissionId, ['author', 'journal']),
    getParticipants.execute(['user'], { submissionId }, undefined, { take: 25 }),
  ]);

  const submission = match(submissionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });
  const [participants] = match(participantsResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return (
    <>
      <SectionHeader title={`Participants \u2014 ${submission.title}`}>
        <ParticipantsToolbar submissionId={submissionId} />
      </SectionHeader>
      <ParticipantsList
        initialParticipants={
          participants.map(ParticipantMapper.fromDomainToDto) as ParticipantDto[]
        }
      />
    </>
  );
}
