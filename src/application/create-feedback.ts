import type {
  FeedbackRepository,
  ParticipantRepository,
  RevisionRepository,
} from '@app/domain/repositories';
import { Either, left, isLeft } from 'effect/Either';
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
  private readonly participantRepository: ParticipantRepository;
  private readonly revisionRepository: RevisionRepository;

  public constructor(
    @inject(SYMBOLS.FeedbackRepository) feedbackRepository: FeedbackRepository,
    @inject(SYMBOLS.ParticipantRepository) participantRepository: ParticipantRepository,
    @inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository,
  ) {
    this.feedbackRepository = feedbackRepository;
    this.participantRepository = participantRepository;
    this.revisionRepository = revisionRepository;
  }

  public async execute(
    feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Feedback, Error>> {
    // 1. Check if user is a participant for the submission
    const participantsEither = await this.participantRepository.getParticipants(undefined, {
      submissionId: feedback.submissionId,
      userId: feedback.authorId,
    });
    if (isLeft(participantsEither)) return left(participantsEither.left);
    const [participants] = participantsEither.right;

    if (participants.length === 0) {
      return left(new Error('User is not a participant for this submission'));
    }

    // 2. Prevent creation if revision is frozen or stage doesn't match
    const revisionEither = await this.revisionRepository.getRevision(feedback.revisionId);
    if (isLeft(revisionEither)) return left(revisionEither.left);
    const revision = revisionEither.right;

    if (revision.isFrozen) {
      return left(new Error('Cannot create feedback: revision is frozen'));
    }

    // Find a matching participant assignment where stage matches revision's current stage
    const matchingParticipant = participants.find((p) => p.stage === revision.currentStage);

    if (!matchingParticipant) {
      return left(
        new Error(
          `Cannot create feedback: revision current stage (${revision.currentStage}) does not match any of participant's assigned stages (${participants.map((p) => p.stage).join(', ')})`,
        ),
      );
    }

    // 3. Ensure they haven't already submitted feedback for this revision at this stage
    const existingFeedbacksEither = await this.feedbackRepository.getFeedbacks(undefined, {
      revisionId: feedback.revisionId,
      authorId: feedback.authorId,
    });
    if (isLeft(existingFeedbacksEither)) return left(existingFeedbacksEither.left);
    const [existingFeedbacks] = existingFeedbacksEither.right;

    // Check if feedback already exists for this specific stage
    const existingFeedbackForStage = existingFeedbacks.find(
      (f) => f.stage === revision.currentStage,
    );

    if (existingFeedbackForStage) {
      return left(
        new Error(`Feedback already exists for this revision at ${revision.currentStage} stage`),
      );
    }

    // Assign the feedback stage based on matching participant's stage
    const feedbackToCreate = {
      ...feedback,
      stage: matchingParticipant.stage as unknown as Feedback['stage'],
    };

    return await this.feedbackRepository.createFeedback(feedbackToCreate, abortSignal);
  }
}
