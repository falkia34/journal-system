import { Either } from 'effect/Either';
import {
  PaginationOptions,
  Decision,
  DecisionFilterOptions,
  DecisionIncludeOptions,
  DecisionSortOptions,
} from '@app/domain/entities';

export interface DecisionRepository {
  getDecisions(
    includeOptions?: DecisionIncludeOptions,
    filterOptions?: DecisionFilterOptions,
    sortOptions?: DecisionSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<[Decision[], PaginationOptions], Error>>;

  getDecision(
    id: string,
    includeOptions?: DecisionIncludeOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Decision, Error>>;

  createDecision(
    decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Decision, Error>>;

  updateDecision(
    id: string,
    decision: Partial<Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Decision, Error>>;

  deleteDecision(
    id: string,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Decision, Error>>;
}
