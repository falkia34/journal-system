import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { RevisionRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import {
  PaginationOptions,
  Revision,
  RevisionFilterOptions,
  RevisionIncludeOptions,
  RevisionSortOptions,
} from '@app/domain/entities';
import { RevisionMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class RevisionRepositoryImpl implements RevisionRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getRevisions(
    includeOptions?: RevisionIncludeOptions,
    filterOptions?: RevisionFilterOptions,
    sortOptions?: RevisionSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[Revision[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const revisions = await this.dataSource.revision.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: buildRevisionOrderBy(sortOptions),
        where: buildRevisionWhere(filterOptions),
        include: buildRevisionInclude(includeOptions),
      });

      const hasNextPage = revisions.length > take;
      const items = revisions
        .slice(0, take)
        .map((revision) => RevisionMapper.fromPrismaToDomain(revision));
      const nextCursor = hasNextPage ? revisions[take]?.id : undefined;

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

  public async getRevision(
    id: string,
    includeOptions?: RevisionIncludeOptions,
  ): Promise<Either<Revision, Error>> {
    try {
      const revision = await this.dataSource.revision.findUnique({
        where: { id },
        include: buildRevisionInclude(includeOptions),
      });

      if (!revision) {
        return left(new Error('Revision not found'));
      }

      return right(RevisionMapper.fromPrismaToDomain(revision));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async getActiveRevisionBySubmissionId(
    submissionId: string,
    includeOptions?: RevisionIncludeOptions,
  ): Promise<Either<Revision, Error>> {
    try {
      const revision = await this.dataSource.revision.findFirst({
        where: { submissionId, isFrozen: false },
        orderBy: { createdAt: 'desc' },
        include: buildRevisionInclude(includeOptions),
      });

      if (!revision) {
        return left(new Error('Revision not found'));
      }

      return right(RevisionMapper.fromPrismaToDomain(revision));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createRevision(
    revision: Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<Revision, Error>> {
    try {
      const created = await this.dataSource.revision.create({
        data: {
          submissionId: revision.submissionId,
          fileId: revision.fileId,
          version: revision.version,
          startStage: revision.startStage,
          currentStage: revision.currentStage,
          isFrozen: revision.isFrozen,
        },
        include: buildRevisionInclude([
          'submission',
          'file',
          'feedbacks',
          'decision',
          'publication',
        ]),
      });

      return right(RevisionMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updateRevision(
    id: string,
    revision: Partial<Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<Revision, Error>> {
    try {
      const updated = await this.dataSource.revision.update({
        where: { id },
        data: {
          submissionId: revision.submissionId,
          fileId: revision.fileId,
          version: revision.version,
          startStage: revision.startStage,
          currentStage: revision.currentStage,
          isFrozen: revision.isFrozen,
        },
        include: buildRevisionInclude([
          'submission',
          'file',
          'feedbacks',
          'decision',
          'publication',
        ]),
      });

      return right(RevisionMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deleteRevision(id: string): Promise<Either<Revision, Error>> {
    try {
      const deleted = await this.dataSource.revision.delete({
        where: { id },
        include: buildRevisionInclude([
          'submission',
          'file',
          'feedbacks',
          'decision',
          'publication',
        ]),
      });

      return right(RevisionMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }
}

const buildRevisionWhere = (filterOptions?: RevisionFilterOptions) => {
  if (!filterOptions) {
    return undefined;
  }

  return {
    ...(filterOptions.submissionId ? { submissionId: filterOptions.submissionId } : {}),
    ...(filterOptions.fileId ? { fileId: filterOptions.fileId } : {}),
    ...(filterOptions.isFrozen !== undefined ? { isFrozen: filterOptions.isFrozen } : {}),
    ...(filterOptions.currentStage ? { currentStage: filterOptions.currentStage } : {}),
  };
};

const buildRevisionOrderBy = (sortOptions?: RevisionSortOptions) => {
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

  if (sortOptions.version) {
    orderBy.push({ version: sortOptions.version });
  }

  return orderBy.length > 0 ? orderBy : { createdAt: 'desc' as const };
};

const buildRevisionInclude = (includeOptions?: RevisionIncludeOptions) => {
  if (!includeOptions || includeOptions.length === 0) {
    return undefined;
  }

  return {
    submission: includeOptions.includes('submission'),
    file: includeOptions.includes('file'),
    feedbacks: includeOptions.includes('feedbacks'),
    decision: includeOptions.includes('decision'),
    publication: includeOptions.includes('publication'),
  };
};
