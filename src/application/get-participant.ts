import type { ParticipantRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Participant, ParticipantIncludeOptions } from '@app/domain/entities';

export type GetParticipantParams = [
  id: string,
  includeOptions?: ParticipantIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetParticipant
  implements UseCase<Promise<Either<Participant, Error>>, GetParticipantParams>
{
  private readonly participantRepository: ParticipantRepository;

  public constructor(
    @inject(SYMBOLS.ParticipantRepository) participantRepository: ParticipantRepository,
  ) {
    this.participantRepository = participantRepository;
  }

  public async execute(
    id: string,
    includeOptions?: ParticipantIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Participant, Error>> {
    return await this.participantRepository.getParticipant(id, includeOptions, abortSignal);
  }
}
