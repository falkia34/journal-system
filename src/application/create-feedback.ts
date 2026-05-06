import type { FeedbackRepository, AuthRepository } from '@app/domain/repositories';
import { Either, left, isRight } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Feedback } from '@app/domain/entities';

export type CreateFeedbackParams = [
  feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class CreateFeedback
  implements UseCase<Promise<Either<Feedback, Error>>, CreateFeedbackParams>
{
  private readonly feedbackRepository: FeedbackRepository;
  private readonly authRepository: AuthRepository;

  public constructor(
    @inject(SYMBOLS.FeedbackRepository) feedbackRepository: FeedbackRepository,
    @inject(SYMBOLS.AuthRepository) authRepository: AuthRepository,
  ) {
    this.feedbackRepository = feedbackRepository;
    this.authRepository = authRepository;
  }

  public async execute(
    feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Feedback, Error>> {
    const accessTokenResult = await this.authRepository.getAccessToken();

    if (isRight(accessTokenResult)) {
      return await this.feedbackRepository.createFeedback(
        feedback,
        abortSignal,
        accessTokenResult.right,
      );
    } else {
      return left(accessTokenResult.left);
    }
  }
}
