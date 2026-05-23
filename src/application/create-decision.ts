import type {
  DecisionRepository,
  SubmissionRepository,
  RevisionRepository,
  PublicationRepository,
} from '@app/domain/repositories';
import { Either, left, right, isLeft } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Decision } from '@app/domain/entities';

export type CreateDecisionParams = [
  decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>,
  isFrozen?: boolean,
  issueId?: string,
  abortSignal?: AbortSignal,
];

@injectable()
export class CreateDecision
  implements UseCase<Promise<Either<Decision, Error>>, CreateDecisionParams>
{
  private readonly decisionRepository: DecisionRepository;
  private readonly submissionRepository: SubmissionRepository;
  private readonly revisionRepository: RevisionRepository;
  private readonly publicationRepository: PublicationRepository;

  public constructor(
    @inject(SYMBOLS.DecisionRepository) decisionRepository: DecisionRepository,
    @inject(SYMBOLS.SubmissionRepository) submissionRepository: SubmissionRepository,
    @inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository,
    @inject(SYMBOLS.PublicationRepository) publicationRepository: PublicationRepository,
  ) {
    this.decisionRepository = decisionRepository;
    this.submissionRepository = submissionRepository;
    this.revisionRepository = revisionRepository;
    this.publicationRepository = publicationRepository;
  }

  public async execute(
    decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>,
    isFrozen?: boolean,
    issueId?: string,
    abortSignal?: AbortSignal,
  ): Promise<Either<Decision, Error>> {
    const createdDecisionEither = await this.decisionRepository.createDecision(
      decision,
      abortSignal,
    );
    if (isLeft(createdDecisionEither)) {
      return createdDecisionEither;
    }
    const createdDecision = createdDecisionEither.right;

    // Update Submission Status
    const submissionEither = await this.submissionRepository.updateSubmission(
      decision.submissionId,
      {
        status: decision.decidedStage,
      },
    );
    if (isLeft(submissionEither)) return left(submissionEither.left);

    // Update Revision currentStage and isFrozen
    const revisionEither = await this.revisionRepository.updateRevision(decision.revisionId, {
      currentStage: decision.decidedStage,
      isFrozen: isFrozen ?? false,
    });
    if (isLeft(revisionEither)) return left(revisionEither.left);

    // Handle Publication logic
    if (decision.decidedStage === 'PUBLISHED') {
      if (!issueId) {
        return left(new Error('issueId is required to publish a revision'));
      }

      const pubEither = await this.publicationRepository.createPublication({
        submissionId: decision.submissionId,
        revisionId: decision.revisionId,
        issueId: issueId,
        publishedAt: new Date(),
      });
      if (isLeft(pubEither)) return left(pubEither.left);
    } else {
      // For any non-PUBLISHED stage (REJECTED, REVIEW, EDIT, etc.), delete existing publication if any
      const pubsEither = await this.publicationRepository.getPublications(undefined, {
        revisionId: decision.revisionId,
      });
      if (!isLeft(pubsEither)) {
        const [pubs] = pubsEither.right;
        for (const pub of pubs) {
          await this.publicationRepository.deletePublication(pub.id);
        }
      }
    }

    return right(createdDecision);
  }
}
