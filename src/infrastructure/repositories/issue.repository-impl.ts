import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { IssueRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import {
  Issue,
  IssueFilterOptions,
  IssueIncludeOptions,
  IssueSortOptions,
  PaginationOptions,
} from '@app/domain/entities';
import { IssueMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class IssueRepositoryImpl implements IssueRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getIssues(
    includeOptions?: IssueIncludeOptions,
    filterOptions?: IssueFilterOptions,
    sortOptions?: IssueSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[Issue[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const issues = await this.dataSource.issue.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: buildIssueOrderBy(sortOptions),
        where: buildIssueWhere(filterOptions),
        include: buildIssueInclude(includeOptions),
      });

      const hasNextPage = issues.length > take;
      const items = issues.slice(0, take).map((issue) => IssueMapper.fromPrismaToDomain(issue));
      const nextCursor = hasNextPage ? issues[take]?.id : undefined;

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

  public async getIssue(
    id: string,
    includeOptions?: IssueIncludeOptions,
  ): Promise<Either<Issue, Error>> {
    try {
      const issue = await this.dataSource.issue.findUnique({
        where: { id },
        include: buildIssueInclude(includeOptions),
      });

      if (!issue) {
        return left(new Error('Issue not found'));
      }

      return right(IssueMapper.fromPrismaToDomain(issue));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createIssue(
    issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<Issue, Error>> {
    try {
      const created = await this.dataSource.issue.create({
        data: {
          journalId: issue.journalId,
          volume: issue.volume,
          number: issue.number,
          title: issue.title,
          description: issue.description,
          publishedAt: issue.publishedAt ?? undefined,
        },
        include: buildIssueInclude(['journal', 'publications']),
      });

      return right(IssueMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updateIssue(
    id: string,
    issue: Partial<Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<Issue, Error>> {
    try {
      const updated = await this.dataSource.issue.update({
        where: { id },
        data: {
          journalId: issue.journalId,
          volume: issue.volume,
          number: issue.number,
          title: issue.title,
          description: issue.description,
          publishedAt: issue.publishedAt,
        },
        include: buildIssueInclude(['journal', 'publications']),
      });

      return right(IssueMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deleteIssue(id: string): Promise<Either<Issue, Error>> {
    try {
      const deleted = await this.dataSource.issue.delete({
        where: { id },
        include: buildIssueInclude(['journal', 'publications']),
      });

      return right(IssueMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }
}

const buildIssueWhere = (filterOptions?: IssueFilterOptions) => {
  if (!filterOptions) {
    return undefined;
  }

  return {
    ...(filterOptions.journalId ? { journalId: filterOptions.journalId } : {}),
    ...(filterOptions.published !== undefined
      ? { publishedAt: filterOptions.published ? { not: null } : null }
      : {}),
  };
};

const buildIssueOrderBy = (sortOptions?: IssueSortOptions) => {
  if (!sortOptions) {
    return { createdAt: 'desc' as const };
  }

  const orderBy: Array<Record<string, 'asc' | 'desc'>> = [];

  if (sortOptions.createdAt) {
    orderBy.push({ createdAt: sortOptions.createdAt.toLowerCase() as 'asc' | 'desc' });
  }

  if (sortOptions.updatedAt) {
    orderBy.push({ updatedAt: sortOptions.updatedAt.toLowerCase() as 'asc' | 'desc' });
  }

  if (sortOptions.publishedAt) {
    orderBy.push({ publishedAt: sortOptions.publishedAt.toLowerCase() as 'asc' | 'desc' });
  }

  if (sortOptions.volume) {
    orderBy.push({ volume: sortOptions.volume.toLowerCase() as 'asc' | 'desc' });
  }

  if (sortOptions.number) {
    orderBy.push({ number: sortOptions.number.toLowerCase() as 'asc' | 'desc' });
  }

  return orderBy.length > 0 ? orderBy : { createdAt: 'desc' as const };
};

const buildIssueInclude = (includeOptions?: IssueIncludeOptions) => {
  if (!includeOptions || includeOptions.length === 0) {
    return undefined;
  }

  return {
    journal: includeOptions.includes('journal'),
    publications: includeOptions.includes('publications'),
  };
};
