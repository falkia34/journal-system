import type { SubmissionRepository, AuthRepository } from '@app/domain/repositories';
import { Either, left, isRight } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Submission, SubmissionIncludeOptions } from '@app/domain/entities';

export type GetSubmissionParams = [
  id: string,
  includeOptions?: SubmissionIncludeOptions,
  abortSignal?: AbortSignal,
  authenticate?: boolean,
];

@injectable()
export class GetSubmission
  implements UseCase<Promise<Either<Submission, Error>>, GetSubmissionParams>
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
    id: string,
    includeOptions?: SubmissionIncludeOptions,
    abortSignal?: AbortSignal,
    authenticate: boolean = true,
  ): Promise<Either<Submission, Error>> {
    let accessToken: string | undefined;

    if (authenticate) {
      const accessTokenResult = await this.authRepository.getAccessToken();

      if (isRight(accessTokenResult)) {
        accessToken = accessTokenResult.right;
      } else {
        return left(accessTokenResult.left);
      }
    }

    return await this.submissionRepository.getSubmission(
      id,
      includeOptions,
      abortSignal,
      accessToken,
    );
  }
}
