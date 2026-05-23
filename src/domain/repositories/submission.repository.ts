import { Either } from 'effect/Either';
import {
  PaginationOptions,
  Submission,
  SubmissionFilterOptions,
  SubmissionIncludeOptions,
  SubmissionSortOptions,
} from '@app/domain/entities';

export interface SubmissionRepository {
  getSubmissions(
    includeOptions?: SubmissionIncludeOptions,
    filterOptions?: SubmissionFilterOptions,
    sortOptions?: SubmissionSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Submission[], PaginationOptions], Error>>;

  getSubmission(
    id: string,
    includeOptions?: SubmissionIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Submission, Error>>;

  createSubmission(
    submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Submission, Error>>;

  updateSubmission(
    id: string,
    submission: Partial<Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Submission, Error>>;

  deleteSubmission(id: string, abortSignal?: AbortSignal): Promise<Either<Submission, Error>>;
}
