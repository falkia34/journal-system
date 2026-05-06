import { Either } from 'effect/Either';
import {
  PaginationOptions,
  Feedback,
  FeedbackFilterOptions,
  FeedbackIncludeOptions,
  FeedbackSortOptions,
} from '@app/domain/entities';

export interface FeedbackRepository {
  getFeedbacks(
    includeOptions?: FeedbackIncludeOptions,
    filterOptions?: FeedbackFilterOptions,
    sortOptions?: FeedbackSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<[Feedback[], PaginationOptions], Error>>;

  getFeedback(
    id: string,
    includeOptions?: FeedbackIncludeOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Feedback, Error>>;

  createFeedback(
    feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Feedback, Error>>;

  updateFeedback(
    id: string,
    feedback: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Feedback, Error>>;

  deleteFeedback(
    id: string,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Feedback, Error>>;
}
