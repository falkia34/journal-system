import type { ParticipantRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Participant } from '@app/domain/entities';

export type DeleteParticipantParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeleteParticipant
  implements UseCase<Promise<Either<Participant, Error>>, DeleteParticipantParams>
{
  private readonly participantRepository: ParticipantRepository;

  public constructor(
    @inject(SYMBOLS.ParticipantRepository) participantRepository: ParticipantRepository,
  ) {
    this.participantRepository = participantRepository;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<Participant, Error>> {
    return await this.participantRepository.deleteParticipant(id, abortSignal);
  }
}
