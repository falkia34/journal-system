import type { ParticipantRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Participant } from '@app/domain/entities';

export type UpdateParticipantParams = [
  id: string,
  participant: Partial<Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>>,
  abortSignal?: AbortSignal,
];

@injectable()
export class UpdateParticipant
  implements UseCase<Promise<Either<Participant, Error>>, UpdateParticipantParams>
{
  private readonly participantRepository: ParticipantRepository;

  public constructor(
    @inject(SYMBOLS.ParticipantRepository) participantRepository: ParticipantRepository,
  ) {
    this.participantRepository = participantRepository;
  }

  public async execute(
    id: string,
    participant: Partial<Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Participant, Error>> {
    return await this.participantRepository.updateParticipant(id, participant, abortSignal);
  }
}
