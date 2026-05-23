import type { FeedbackRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Feedback, FeedbackIncludeOptions } from '@app/domain/entities';

export type GetFeedbackParams = [
  id: string,
  includeOptions?: FeedbackIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetFeedback implements UseCase<Promise<Either<Feedback, Error>>, GetFeedbackParams> {
  private readonly feedbackRepository: FeedbackRepository;

  public constructor(@inject(SYMBOLS.FeedbackRepository) feedbackRepository: FeedbackRepository) {
    this.feedbackRepository = feedbackRepository;
  }

  public async execute(
    id: string,
    includeOptions?: FeedbackIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Feedback, Error>> {
    return await this.feedbackRepository.getFeedback(id, includeOptions, abortSignal);
  }
}
