import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { DecisionRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import {
  Decision,
  DecisionFilterOptions,
  DecisionIncludeOptions,
  DecisionSortOptions,
  PaginationOptions,
} from '@app/domain/entities';
import { DecisionMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class DecisionRepositoryImpl implements DecisionRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getDecisions(
    includeOptions?: DecisionIncludeOptions,
    filterOptions?: DecisionFilterOptions,
    sortOptions?: DecisionSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[Decision[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const decisions = await this.dataSource.decision.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: this.buildDecisionOrderBy(sortOptions),
        where: this.buildDecisionWhere(filterOptions),
        include: this.buildDecisionInclude(includeOptions),
      });

      const hasNextPage = decisions.length > take;
      const items = decisions
        .slice(0, take)
        .map((decision) => DecisionMapper.fromPrismaToDomain(decision));
      const nextCursor = hasNextPage ? decisions[take]?.id : undefined;

      return right([
        items,
        new PaginationOptions(
          take,
          paginationOptions?.cursor,
          nextCursor,
          paginationOptions?.previousCursor,
        ),
      ]);
    } catch (error) {
      return left(error as Error);
    }
  }

  public async getDecision(
    id: string,
    includeOptions?: DecisionIncludeOptions,
  ): Promise<Either<Decision, Error>> {
    try {
      const decision = await this.dataSource.decision.findUnique({
        where: { id },
        include: this.buildDecisionInclude(includeOptions),
      });

      if (!decision) {
        return left(new Error('Decision not found'));
      }

      return right(DecisionMapper.fromPrismaToDomain(decision));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createDecision(
    decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<Decision, Error>> {
    try {
      const created = await this.dataSource.decision.create({
        data: {
          submissionId: decision.submissionId,
          revisionId: decision.revisionId,
          deciderId: decision.deciderId,
          startStage: decision.startStage,
          decidedStage: decision.decidedStage,
          comment: decision.comment,
        },
        include: this.buildDecisionInclude(['submission', 'revision', 'decider']),
      });

      return right(DecisionMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updateDecision(
    id: string,
    decision: Partial<Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<Decision, Error>> {
    try {
      const updated = await this.dataSource.decision.update({
        where: { id },
        data: {
          submissionId: decision.submissionId,
          revisionId: decision.revisionId,
          deciderId: decision.deciderId,
          startStage: decision.startStage,
          decidedStage: decision.decidedStage,
          comment: decision.comment,
        },
        include: this.buildDecisionInclude(['submission', 'revision', 'decider']),
      });

      return right(DecisionMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deleteDecision(id: string): Promise<Either<Decision, Error>> {
    try {
      const deleted = await this.dataSource.decision.delete({
        where: { id },
        include: this.buildDecisionInclude(['submission', 'revision', 'decider']),
      });

      return right(DecisionMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }

  private buildDecisionWhere = (filterOptions?: DecisionFilterOptions) => {
    if (!filterOptions) {
      return undefined;
    }

    return {
      ...(filterOptions.submissionId ? { submissionId: filterOptions.submissionId } : {}),
      ...(filterOptions.revisionId ? { revisionId: filterOptions.revisionId } : {}),
      ...(filterOptions.deciderId ? { deciderId: filterOptions.deciderId } : {}),
    };
  };

  private buildDecisionOrderBy = (sortOptions?: DecisionSortOptions) => {
    if (!sortOptions) {
      return { createdAt: 'desc' as const };
    }

    const orderBy: Array<Record<string, 'asc' | 'desc'>> = [];

    if (sortOptions.createdAt) {
      orderBy.push({ createdAt: sortOptions.createdAt });
    }

    if (sortOptions.updatedAt) {
      orderBy.push({ updatedAt: sortOptions.updatedAt });
    }

    return orderBy.length > 0 ? orderBy : { createdAt: 'desc' as const };
  };

  private buildDecisionInclude = (includeOptions?: DecisionIncludeOptions) => {
    if (!includeOptions || includeOptions.length === 0) {
      return undefined;
    }

    return {
      submission: includeOptions.includes('submission'),
      revision: includeOptions.includes('revision'),
      decider: includeOptions.includes('decider'),
    };
  };
}
