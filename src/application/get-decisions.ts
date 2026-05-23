import type { DecisionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import {
  Decision,
  PaginationOptions,
  DecisionIncludeOptions,
  DecisionFilterOptions,
  DecisionSortOptions,
} from '@app/domain/entities';

export type GetDecisionsParams = [
  includeOptions?: DecisionIncludeOptions,
  filterOptions?: DecisionFilterOptions,
  sortOptions?: DecisionSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetDecisions
  implements UseCase<Promise<Either<[Decision[], PaginationOptions], Error>>, GetDecisionsParams>
{
  private readonly decisionRepository: DecisionRepository;

  public constructor(@inject(SYMBOLS.DecisionRepository) decisionRepository: DecisionRepository) {
    this.decisionRepository = decisionRepository;
  }

  public async execute(
    includeOptions?: DecisionIncludeOptions,
    filterOptions?: DecisionFilterOptions,
    sortOptions?: DecisionSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Decision[], PaginationOptions], Error>> {
    return await this.decisionRepository.getDecisions(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
