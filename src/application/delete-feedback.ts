import type { FeedbackRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Feedback } from '@app/domain/entities';

export type DeleteFeedbackParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeleteFeedback
  implements UseCase<Promise<Either<Feedback, Error>>, DeleteFeedbackParams>
{
  private readonly feedbackRepository: FeedbackRepository;

  public constructor(@inject(SYMBOLS.FeedbackRepository) feedbackRepository: FeedbackRepository) {
    this.feedbackRepository = feedbackRepository;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<Feedback, Error>> {
    return await this.feedbackRepository.deleteFeedback(id, abortSignal);
  }
}
