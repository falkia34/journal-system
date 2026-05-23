import type { IssueRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import {
  Issue,
  PaginationOptions,
  IssueIncludeOptions,
  IssueFilterOptions,
  IssueSortOptions,
} from '@app/domain/entities';

export type GetIssuesParams = [
  includeOptions?: IssueIncludeOptions,
  filterOptions?: IssueFilterOptions,
  sortOptions?: IssueSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetIssues
  implements UseCase<Promise<Either<[Issue[], PaginationOptions], Error>>, GetIssuesParams>
{
  private readonly issueRepository: IssueRepository;

  public constructor(@inject(SYMBOLS.IssueRepository) issueRepository: IssueRepository) {
    this.issueRepository = issueRepository;
  }

  public async execute(
    includeOptions?: IssueIncludeOptions,
    filterOptions?: IssueFilterOptions,
    sortOptions?: IssueSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Issue[], PaginationOptions], Error>> {
    return await this.issueRepository.getIssues(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
