import { GetParticipant, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { ParticipantDto, ParticipantMapper } from '@app/infrastructure/dtos';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { ParticipantForm } from '@app/presentation/components/internal/admin/participants';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ submissionId: string; participantId: string }>;
};

export default async function EditParticipantPage({ params }: Props) {
  const { participantId } = await params;

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

  const getParticipant = serverContainer.get<GetParticipant>(SYMBOLS.GetParticipant);
  const participantResult = await getParticipant.execute(participantId, ['submission', 'user']);
  const participant = match(participantResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return (
    <ParticipantForm
      initialParticipant={ParticipantMapper.fromDomainToDto(participant) as ParticipantDto}
    />
  );
}
