import type { FeedbackRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Feedback } from '@app/domain/entities';

export type UpdateFeedbackParams = [
  id: string,
  feedback: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>,
  abortSignal?: AbortSignal,
];

@injectable()
export class UpdateFeedback
  implements UseCase<Promise<Either<Feedback, Error>>, UpdateFeedbackParams>
{
  private readonly feedbackRepository: FeedbackRepository;

  public constructor(@inject(SYMBOLS.FeedbackRepository) feedbackRepository: FeedbackRepository) {
    this.feedbackRepository = feedbackRepository;
  }

  public async execute(
    id: string,
    feedback: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Feedback, Error>> {
    return await this.feedbackRepository.updateFeedback(id, feedback, abortSignal);
  }
}
