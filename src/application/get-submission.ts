import type { SubmissionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Submission, SubmissionIncludeOptions } from '@app/domain/entities';

export type GetSubmissionParams = [
  id: string,
  includeOptions?: SubmissionIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetSubmission
  implements UseCase<Promise<Either<Submission, Error>>, GetSubmissionParams>
{
  private readonly submissionRepository: SubmissionRepository;

  public constructor(
    @inject(SYMBOLS.SubmissionRepository) submissionRepository: SubmissionRepository,
  ) {
    this.submissionRepository = submissionRepository;
  }

  public async execute(
    id: string,
    includeOptions?: SubmissionIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Submission, Error>> {
    return await this.submissionRepository.getSubmission(id, includeOptions, abortSignal);
  }
}
