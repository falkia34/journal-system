import type { ParticipantRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Participant } from '@app/domain/entities';

export type CreateParticipantParams = [
  participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class CreateParticipant
  implements UseCase<Promise<Either<Participant, Error>>, CreateParticipantParams>
{
  private readonly participantRepository: ParticipantRepository;

  public constructor(
    @inject(SYMBOLS.ParticipantRepository) participantRepository: ParticipantRepository,
  ) {
    this.participantRepository = participantRepository;
  }

  public async execute(
    participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Participant, Error>> {
    return await this.participantRepository.createParticipant(participant, abortSignal);
  }
}
