import { Either } from 'effect/Either';
import {
  PaginationOptions,
  Journal,
  JournalFilterOptions,
  JournalIncludeOptions,
  JournalSortOptions,
} from '@app/domain/entities';

export interface JournalRepository {
  getJournals(
    includeOptions?: JournalIncludeOptions,
    filterOptions?: JournalFilterOptions,
    sortOptions?: JournalSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<[Journal[], PaginationOptions], Error>>;

  getJournal(
    id: string,
    includeOptions?: JournalIncludeOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Journal, Error>>;

  createJournal(
    journal: Omit<Journal, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Journal, Error>>;

  updateJournal(
    id: string,
    journal: Partial<Omit<Journal, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Journal, Error>>;

  deleteJournal(
    id: string,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Journal, Error>>;
}
