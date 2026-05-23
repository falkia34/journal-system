import type { RevisionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Revision, RevisionIncludeOptions } from '@app/domain/entities';

export type GetActiveRevisionParams = [
  submissionId: string,
  includeOptions?: RevisionIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetActiveRevision
  implements UseCase<Promise<Either<Revision, Error>>, GetActiveRevisionParams>
{
  private readonly revisionRepository: RevisionRepository;

  public constructor(@inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository) {
    this.revisionRepository = revisionRepository;
  }

  public async execute(
    submissionId: string,
    includeOptions?: RevisionIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>> {
    return await this.revisionRepository.getActiveRevisionBySubmissionId(
      submissionId,
      includeOptions,
      abortSignal,
    );
  }
}
