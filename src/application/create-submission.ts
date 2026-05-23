import type { SubmissionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
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

  public constructor(
    @inject(SYMBOLS.SubmissionRepository) submissionRepository: SubmissionRepository,
  ) {
    this.submissionRepository = submissionRepository;
  }

  public async execute(
    submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Submission, Error>> {
    return await this.submissionRepository.createSubmission(submission, abortSignal);
  }
}
