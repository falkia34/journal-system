import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { SubmissionRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import {
  PaginationOptions,
  Submission,
  SubmissionFilterOptions,
  SubmissionIncludeOptions,
  SubmissionSortOptions,
} from '@app/domain/entities';
import { SubmissionMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class SubmissionRepositoryImpl implements SubmissionRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getSubmissions(
    includeOptions?: SubmissionIncludeOptions,
    filterOptions?: SubmissionFilterOptions,
    sortOptions?: SubmissionSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[Submission[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const submissions = await this.dataSource.submission.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: buildSubmissionOrderBy(sortOptions),
        where: buildSubmissionWhere(filterOptions),
        include: buildSubmissionInclude(includeOptions),
      });

      const hasNextPage = submissions.length > take;
      const items = submissions
        .slice(0, take)
        .map((submission) => SubmissionMapper.fromPrismaToDomain(submission));
      const nextCursor = hasNextPage ? submissions[take]?.id : undefined;

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

  public async getSubmission(
    id: string,
    includeOptions?: SubmissionIncludeOptions,
  ): Promise<Either<Submission, Error>> {
    try {
      const submission = await this.dataSource.submission.findUnique({
        where: { id },
        include: buildSubmissionInclude(includeOptions),
      });

      if (!submission) {
        return left(new Error('Submission not found'));
      }

      return right(SubmissionMapper.fromPrismaToDomain(submission));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createSubmission(
    submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<Submission, Error>> {
    try {
      const created = await this.dataSource.submission.create({
        data: {
          authorId: submission.authorId,
          journalId: submission.journalId,
          title: submission.title,
          abstract: submission.abstract,
          status: submission.status,
        },
        include: buildSubmissionInclude(),
      });

      return right(SubmissionMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updateSubmission(
    id: string,
    submission: Partial<Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<Submission, Error>> {
    try {
      const updated = await this.dataSource.submission.update({
        where: { id },
        data: {
          authorId: submission.authorId,
          journalId: submission.journalId,
          title: submission.title,
          abstract: submission.abstract,
          status: submission.status,
        },
        include: buildSubmissionInclude(),
      });

      return right(SubmissionMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deleteSubmission(id: string): Promise<Either<Submission, Error>> {
    try {
      const deleted = await this.dataSource.submission.delete({
        where: { id },
        include: buildSubmissionInclude(),
      });

      return right(SubmissionMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }
}

const buildSubmissionWhere = (filterOptions?: SubmissionFilterOptions) => {
  return {
    ...(filterOptions?.journalId ? { journalId: filterOptions.journalId } : {}),
    ...(filterOptions?.authorId ? { authorId: filterOptions.authorId } : {}),
    ...(filterOptions?.status ? { status: filterOptions.status } : {}),
  };
};

const buildSubmissionOrderBy = (sortOptions?: SubmissionSortOptions) => {
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

  if (sortOptions.title) {
    orderBy.push({ title: sortOptions.title });
  }

  return orderBy.length > 0 ? orderBy : { createdAt: 'desc' as const };
};

const buildSubmissionInclude = (includeOptions?: SubmissionIncludeOptions) => {
  if (!includeOptions || includeOptions.length === 0) {
    return undefined;
  }

  return {
    author: includeOptions.includes('author'),
    journal: includeOptions.includes('journal'),
  };
};
