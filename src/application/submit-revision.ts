import type { RevisionRepository, SubmissionRepository } from '@app/domain/repositories';
import { left, isLeft, right } from 'effect/Either';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Revision } from '@app/domain/entities';

export type SubmitRevisionParams = [
  revision: Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class SubmitRevision
  implements UseCase<Promise<Either<Revision, Error>>, SubmitRevisionParams>
{
  private readonly revisionRepository: RevisionRepository;
  private readonly submissionRepository: SubmissionRepository;

  public constructor(
    @inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository,
    @inject(SYMBOLS.SubmissionRepository) submissionRepository: SubmissionRepository,
  ) {
    this.revisionRepository = revisionRepository;
    this.submissionRepository = submissionRepository;
  }

  public async execute(
    revision: Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>> {
    const submissionResult = await this.submissionRepository.getSubmission(
      revision.submissionId,
      [],
      abortSignal,
    );
    if (isLeft(submissionResult)) {
      return left(submissionResult.left);
    }

    const submission = submissionResult.right;
    const isFirstRevision = submission.status === 'DRAFT';

    // Get latest revision to inherit stage
    const revisionsResult = await this.revisionRepository.getRevisions(
      undefined,
      { submissionId: revision.submissionId },
      { createdAt: 'DESC' },
      { take: 1 },
    );
    if (isLeft(revisionsResult)) return left(revisionsResult.left);
    const [revisions] = revisionsResult.right;

    if (revisions.length > 0) {
      const latestRevision = revisions[0];
      revision.startStage = latestRevision.currentStage;
      revision.currentStage = latestRevision.currentStage;
    } else {
      revision.startStage = 'SUBMITTED';
      revision.currentStage = 'SUBMITTED';
    }

    revision.isFrozen = false;

    const createdRevisionResult = await this.revisionRepository.createRevision(
      revision,
      abortSignal,
    );

    if (isLeft(createdRevisionResult)) {
      return createdRevisionResult;
    }

    if (isFirstRevision) {
      const updateResult = await this.submissionRepository.updateSubmission(
        submission.id,
        { ...submission, status: 'SUBMITTED' },
        abortSignal,
      );
      if (isLeft(updateResult)) {
        return left(updateResult.left);
      }
    }

    return right(createdRevisionResult.right);
  }
}
