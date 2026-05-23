import type { SubmissionRepository, AuthRepository } from '@app/domain/repositories';
import { Either, left, isLeft } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import {
  Submission,
  PaginationOptions,
  SubmissionIncludeOptions,
  SubmissionFilterOptions,
  SubmissionSortOptions,
} from '@app/domain/entities';

export type GetSubmissionsParams = [
  includeOptions?: SubmissionIncludeOptions,
  filterOptions?: SubmissionFilterOptions,
  sortOptions?: SubmissionSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetSubmissions
  implements
    UseCase<Promise<Either<[Submission[], PaginationOptions], Error>>, GetSubmissionsParams>
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
    includeOptions?: SubmissionIncludeOptions,
    filterOptions?: SubmissionFilterOptions,
    sortOptions?: SubmissionSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Submission[], PaginationOptions], Error>> {
    const sessionResult = await this.authRepository.getSession();
    if (isLeft(sessionResult)) return left(sessionResult.left);
    const session = sessionResult.right;

    const role = session.activeRole;
    if (role === 'EDITOR') {
      filterOptions = {
        ...filterOptions,
        participantUserId: session.user.id,
        participantStages: ['EDIT', 'COPY_EDIT', 'LAYOUT_EDIT', 'FINAL_REVIEW'],
      };
    } else if (role === 'REVIEWER') {
      filterOptions = {
        ...filterOptions,
        participantUserId: session.user.id,
        participantStages: ['REVIEW', 'FINAL_REVIEW'],
      };
    } else if (role === 'AUTHOR') {
      filterOptions = { ...filterOptions, authorId: session.user.id };
    }

    return await this.submissionRepository.getSubmissions(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
