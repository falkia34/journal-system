import type { SubmissionRepository, AuthRepository } from '@app/domain/repositories';
import { Either, left, isRight } from 'effect/Either';
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
  authenticate?: boolean,
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
    authenticate: boolean = true,
  ): Promise<Either<[Submission[], PaginationOptions], Error>> {
    let accessToken: string | undefined;

    if (authenticate) {
      const accessTokenResult = await this.authRepository.getAccessToken();

      if (isRight(accessTokenResult)) {
        accessToken = accessTokenResult.right;
      } else {
        return left(accessTokenResult.left);
      }
    }

    return await this.submissionRepository.getSubmissions(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
      accessToken,
    );
  }
}
