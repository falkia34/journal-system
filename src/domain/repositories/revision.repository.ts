import { Either } from 'effect/Either';
import {
  PaginationOptions,
  Revision,
  RevisionFilterOptions,
  RevisionIncludeOptions,
  RevisionSortOptions,
} from '@app/domain/entities';

export interface RevisionRepository {
  getRevisions(
    includeOptions?: RevisionIncludeOptions,
    filterOptions?: RevisionFilterOptions,
    sortOptions?: RevisionSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Revision[], PaginationOptions], Error>>;

  getRevision(
    id: string,
    includeOptions?: RevisionIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>>;

  getActiveRevisionBySubmissionId(
    submissionId: string,
    includeOptions?: RevisionIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>>;

  createRevision(
    revision: Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>>;

  updateRevision(
    id: string,
    revision: Partial<Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>>;

  deleteRevision(id: string, abortSignal?: AbortSignal): Promise<Either<Revision, Error>>;
}
