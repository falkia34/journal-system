import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { FeedbackRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import {
  Feedback,
  FeedbackFilterOptions,
  FeedbackIncludeOptions,
  FeedbackSortOptions,
  PaginationOptions,
} from '@app/domain/entities';
import { FeedbackMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class FeedbackRepositoryImpl implements FeedbackRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getFeedbacks(
    includeOptions?: FeedbackIncludeOptions,
    filterOptions?: FeedbackFilterOptions,
    sortOptions?: FeedbackSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[Feedback[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const feedbacks = await this.dataSource.feedback.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: buildFeedbackOrderBy(sortOptions),
        where: buildFeedbackWhere(filterOptions),
        include: buildFeedbackInclude(includeOptions),
      });

      const hasNextPage = feedbacks.length > take;
      const items = feedbacks
        .slice(0, take)
        .map((feedback) => FeedbackMapper.fromPrismaToDomain(feedback));
      const nextCursor = hasNextPage ? feedbacks[take]?.id : undefined;

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

  public async getFeedback(
    id: string,
    includeOptions?: FeedbackIncludeOptions,
  ): Promise<Either<Feedback, Error>> {
    try {
      const feedback = await this.dataSource.feedback.findUnique({
        where: { id },
        include: buildFeedbackInclude(includeOptions),
      });

      if (!feedback) {
        return left(new Error('Feedback not found'));
      }

      return right(FeedbackMapper.fromPrismaToDomain(feedback));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createFeedback(
    feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<Feedback, Error>> {
    try {
      const created = await this.dataSource.feedback.create({
        data: {
          submissionId: feedback.submissionId,
          revisionId: feedback.revisionId,
          authorId: feedback.authorId,
          fileId: feedback.fileId,
          content: feedback.content,
          stage: feedback.stage,
          recommendation: feedback.recommendation,
        },
        include: buildFeedbackInclude(['submission', 'revision', 'author', 'file']),
      });

      return right(FeedbackMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updateFeedback(
    id: string,
    feedback: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<Feedback, Error>> {
    try {
      const updated = await this.dataSource.feedback.update({
        where: { id },
        data: {
          submissionId: feedback.submissionId,
          revisionId: feedback.revisionId,
          authorId: feedback.authorId,
          fileId: feedback.fileId,
          content: feedback.content,
          stage: feedback.stage,
          recommendation: feedback.recommendation,
        },
        include: buildFeedbackInclude(['submission', 'revision', 'author', 'file']),
      });

      return right(FeedbackMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deleteFeedback(id: string): Promise<Either<Feedback, Error>> {
    try {
      const deleted = await this.dataSource.feedback.delete({
        where: { id },
        include: buildFeedbackInclude(['submission', 'revision', 'author', 'file']),
      });

      return right(FeedbackMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }
}

const buildFeedbackWhere = (filterOptions?: FeedbackFilterOptions) => {
  if (!filterOptions) {
    return undefined;
  }

  return {
    ...(filterOptions.submissionId ? { submissionId: filterOptions.submissionId } : {}),
    ...(filterOptions.revisionId ? { revisionId: filterOptions.revisionId } : {}),
    ...(filterOptions.authorId ? { authorId: filterOptions.authorId } : {}),
    ...(filterOptions.recommendation ? { recommendation: filterOptions.recommendation } : {}),
  };
};

const buildFeedbackOrderBy = (sortOptions?: FeedbackSortOptions) => {
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

const buildFeedbackInclude = (includeOptions?: FeedbackIncludeOptions) => {
  if (!includeOptions || includeOptions.length === 0) {
    return undefined;
  }

  return {
    submission: includeOptions.includes('submission'),
    revision: includeOptions.includes('revision'),
    author: includeOptions.includes('author'),
    file: includeOptions.includes('file'),
  };
};
