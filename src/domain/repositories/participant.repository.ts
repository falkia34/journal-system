import { Either } from 'effect/Either';
import {
  PaginationOptions,
  Participant,
  ParticipantFilterOptions,
  ParticipantIncludeOptions,
  ParticipantSortOptions,
} from '@app/domain/entities';

export interface ParticipantRepository {
  getParticipants(
    includeOptions?: ParticipantIncludeOptions,
    filterOptions?: ParticipantFilterOptions,
    sortOptions?: ParticipantSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Participant[], PaginationOptions], Error>>;

  getParticipant(
    id: string,
    includeOptions?: ParticipantIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Participant, Error>>;

  createParticipant(
    participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Participant, Error>>;

  updateParticipant(
    id: string,
    participant: Partial<Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Participant, Error>>;

  deleteParticipant(id: string, abortSignal?: AbortSignal): Promise<Either<Participant, Error>>;
}
