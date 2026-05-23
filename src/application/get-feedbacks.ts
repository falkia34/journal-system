import type { FeedbackRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import {
  Feedback,
  PaginationOptions,
  FeedbackIncludeOptions,
  FeedbackFilterOptions,
  FeedbackSortOptions,
} from '@app/domain/entities';

export type GetFeedbacksParams = [
  includeOptions?: FeedbackIncludeOptions,
  filterOptions?: FeedbackFilterOptions,
  sortOptions?: FeedbackSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetFeedbacks
  implements UseCase<Promise<Either<[Feedback[], PaginationOptions], Error>>, GetFeedbacksParams>
{
  private readonly feedbackRepository: FeedbackRepository;

  public constructor(@inject(SYMBOLS.FeedbackRepository) feedbackRepository: FeedbackRepository) {
    this.feedbackRepository = feedbackRepository;
  }

  public async execute(
    includeOptions?: FeedbackIncludeOptions,
    filterOptions?: FeedbackFilterOptions,
    sortOptions?: FeedbackSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Feedback[], PaginationOptions], Error>> {
    return await this.feedbackRepository.getFeedbacks(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
