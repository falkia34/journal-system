import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { PublicationRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import {
  PaginationOptions,
  Publication,
  PublicationFilterOptions,
  PublicationIncludeOptions,
  PublicationSortOptions,
} from '@app/domain/entities';
import { PublicationMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class PublicationRepositoryImpl implements PublicationRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getPublications(
    includeOptions?: PublicationIncludeOptions,
    filterOptions?: PublicationFilterOptions,
    sortOptions?: PublicationSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[Publication[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const publications = await this.dataSource.publication.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: buildPublicationOrderBy(sortOptions),
        where: buildPublicationWhere(filterOptions),
        include: buildPublicationInclude(includeOptions),
      });

      const hasNextPage = publications.length > take;
      const items = publications
        .slice(0, take)
        .map((publication) => PublicationMapper.fromPrismaToDomain(publication));
      const nextCursor = hasNextPage ? publications[take]?.id : undefined;

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

  public async getPublication(
    id: string,
    includeOptions?: PublicationIncludeOptions,
  ): Promise<Either<Publication, Error>> {
    try {
      const publication = await this.dataSource.publication.findUnique({
        where: { id },
        include: buildPublicationInclude(includeOptions),
      });

      if (!publication) {
        return left(new Error('Publication not found'));
      }

      return right(PublicationMapper.fromPrismaToDomain(publication));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createPublication(
    publication: Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<Publication, Error>> {
    try {
      const created = await this.dataSource.publication.create({
        data: {
          issueId: publication.issueId,
          submissionId: publication.submissionId,
          revisionId: publication.revisionId,
          publishedAt: publication.publishedAt,
        },
        include: buildPublicationInclude(['issue', 'submission', 'revision']),
      });

      return right(PublicationMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updatePublication(
    id: string,
    publication: Partial<Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<Publication, Error>> {
    try {
      const updated = await this.dataSource.publication.update({
        where: { id },
        data: {
          issueId: publication.issueId,
          submissionId: publication.submissionId,
          revisionId: publication.revisionId,
          publishedAt: publication.publishedAt ?? undefined,
        },
        include: buildPublicationInclude(['issue', 'submission', 'revision']),
      });

      return right(PublicationMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deletePublication(id: string): Promise<Either<Publication, Error>> {
    try {
      const deleted = await this.dataSource.publication.delete({
        where: { id },
        include: buildPublicationInclude(['issue', 'submission', 'revision']),
      });

      return right(PublicationMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }
}

const buildPublicationWhere = (filterOptions?: PublicationFilterOptions) => {
  if (!filterOptions) {
    return undefined;
  }

  return {
    ...(filterOptions.issueId ? { issueId: filterOptions.issueId } : {}),
    ...(filterOptions.submissionId ? { submissionId: filterOptions.submissionId } : {}),
    ...(filterOptions.revisionId ? { revisionId: filterOptions.revisionId } : {}),
  };
};

const buildPublicationOrderBy = (sortOptions?: PublicationSortOptions) => {
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

  return orderBy.length > 0 ? orderBy : { createdAt: 'desc' as const };
};

const buildPublicationInclude = (includeOptions?: PublicationIncludeOptions) => {
  if (!includeOptions || includeOptions.length === 0) {
    return undefined;
  }

  return {
    issue: includeOptions.includes('issue'),
    submission: includeOptions.includes('submission'),
    revision: includeOptions.includes('revision'),
  };
};
