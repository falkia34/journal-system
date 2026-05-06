import { Either } from 'effect/Either';
import {
  PaginationOptions,
  Issue,
  IssueFilterOptions,
  IssueIncludeOptions,
  IssueSortOptions,
} from '@app/domain/entities';

export interface IssueRepository {
  getIssues(
    includeOptions?: IssueIncludeOptions,
    filterOptions?: IssueFilterOptions,
    sortOptions?: IssueSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<[Issue[], PaginationOptions], Error>>;

  getIssue(
    id: string,
    includeOptions?: IssueIncludeOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Issue, Error>>;

  createIssue(
    issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Issue, Error>>;

  updateIssue(
    id: string,
    issue: Partial<Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Issue, Error>>;

  deleteIssue(id: string, abortSignal?: AbortSignal, token?: string): Promise<Either<Issue, Error>>;
}
