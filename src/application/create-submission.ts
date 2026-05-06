import type { SubmissionRepository, AuthRepository } from '@app/domain/repositories';
import { Either, left, isRight } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Submission } from '@app/domain/entities';

export type CreateSubmissionParams = [
  submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class CreateSubmission
  implements UseCase<Promise<Either<Submission, Error>>, CreateSubmissionParams>
{
  private readonly submissionRepository: SubmissionRepository;
  private readonly authRepository: AuthRepository;

  public constructor(
    @inject(SYMBOLS.SubmissionRepository) submissionRepository: SubmissionRepository,
    @inject(SYMBOLS.AuthRepository) authRepository: AuthRepository,
  ) {
    this.submissionRepository = submissionRepository;
    this.authRepository = authRepository;
  }

  public async execute(
    submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Submission, Error>> {
    const accessTokenResult = await this.authRepository.getAccessToken();

    if (isRight(accessTokenResult)) {
      return await this.submissionRepository.createSubmission(
        submission,
        abortSignal,
        accessTokenResult.right,
      );
    } else {
      return left(accessTokenResult.left);
    }
  }
}
