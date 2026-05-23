import type { SubmissionRepository } from '@app/domain/repositories';
import { Either, left, isLeft } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { GetSession } from './get-session';
import { Submission } from '@app/domain/entities';

export type DeleteSubmissionParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeleteSubmission
  implements UseCase<Promise<Either<Submission, Error>>, DeleteSubmissionParams>
{
  private readonly submissionRepository: SubmissionRepository;
  private readonly getSession: GetSession;

  public constructor(
    @inject(SYMBOLS.SubmissionRepository) submissionRepository: SubmissionRepository,
    @inject(SYMBOLS.GetSession) getSession: GetSession,
  ) {
    this.submissionRepository = submissionRepository;
    this.getSession = getSession;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<Submission, Error>> {
    const sessionResult = await this.getSession.execute();
    if (isLeft(sessionResult)) return left(sessionResult.left);

    if (sessionResult.right.activeRole !== 'ADMINISTRATOR') {
      return left(new Error('Only Administrators can delete submissions'));
    }

    return await this.submissionRepository.deleteSubmission(id, abortSignal);
  }
}
