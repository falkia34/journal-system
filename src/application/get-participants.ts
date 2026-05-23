import type { ParticipantRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import {
  Participant,
  PaginationOptions,
  ParticipantIncludeOptions,
  ParticipantFilterOptions,
  ParticipantSortOptions,
} from '@app/domain/entities';

export type GetParticipantsParams = [
  includeOptions?: ParticipantIncludeOptions,
  filterOptions?: ParticipantFilterOptions,
  sortOptions?: ParticipantSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetParticipants
  implements
    UseCase<Promise<Either<[Participant[], PaginationOptions], Error>>, GetParticipantsParams>
{
  private readonly participantRepository: ParticipantRepository;

  public constructor(
    @inject(SYMBOLS.ParticipantRepository) participantRepository: ParticipantRepository,
  ) {
    this.participantRepository = participantRepository;
  }

  public async execute(
    includeOptions?: ParticipantIncludeOptions,
    filterOptions?: ParticipantFilterOptions,
    sortOptions?: ParticipantSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Participant[], PaginationOptions], Error>> {
    return await this.participantRepository.getParticipants(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
