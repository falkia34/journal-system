import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { JournalRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import {
  Journal,
  JournalFilterOptions,
  JournalIncludeOptions,
  JournalSortOptions,
  PaginationOptions,
} from '@app/domain/entities';
import { JournalMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class JournalRepositoryImpl implements JournalRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getJournals(
    includeOptions?: JournalIncludeOptions,
    filterOptions?: JournalFilterOptions,
    sortOptions?: JournalSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[Journal[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const journals = await this.dataSource.journal.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: buildJournalOrderBy(sortOptions),
        where: buildJournalWhere(filterOptions),
        include: buildJournalInclude(includeOptions),
      });

      const hasNextPage = journals.length > take;
      const items = journals
        .slice(0, take)
        .map((journal) => JournalMapper.fromPrismaToDomain(journal));
      const nextCursor = hasNextPage ? journals[take]?.id : undefined;

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

  public async getJournal(
    id: string,
    includeOptions?: JournalIncludeOptions,
  ): Promise<Either<Journal, Error>> {
    try {
      const journal = await this.dataSource.journal.findUnique({
        where: { id },
        include: buildJournalInclude(includeOptions),
      });

      if (!journal) {
        return left(new Error('Journal not found'));
      }

      return right(JournalMapper.fromPrismaToDomain(journal));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createJournal(
    journal: Omit<Journal, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<Journal, Error>> {
    try {
      const created = await this.dataSource.journal.create({
        data: {
          name: journal.name,
          description: journal.description,
          editorInChiefId: journal.editorInChiefId,
        },
        include: buildJournalInclude(['editorInChief']),
      });

      return right(JournalMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updateJournal(
    id: string,
    journal: Partial<Omit<Journal, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<Journal, Error>> {
    try {
      const updated = await this.dataSource.journal.update({
        where: { id },
        data: {
          name: journal.name,
          description: journal.description,
          editorInChiefId: journal.editorInChiefId,
        },
        include: buildJournalInclude(['editorInChief']),
      });

      return right(JournalMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deleteJournal(id: string): Promise<Either<Journal, Error>> {
    try {
      const deleted = await this.dataSource.journal.delete({
        where: { id },
        include: buildJournalInclude(['editorInChief']),
      });

      return right(JournalMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }
}

const buildJournalWhere = (filterOptions?: JournalFilterOptions) => {
  if (!filterOptions) {
    return undefined;
  }

  return {
    ...(filterOptions.name
      ? { name: { contains: filterOptions.name, mode: 'insensitive' as const } }
      : {}),
    ...(filterOptions.editorInChiefId ? { editorInChiefId: filterOptions.editorInChiefId } : {}),
  };
};

const buildJournalOrderBy = (sortOptions?: JournalSortOptions) => {
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

  if (sortOptions.name) {
    orderBy.push({ name: sortOptions.name });
  }

  return orderBy.length > 0 ? orderBy : { createdAt: 'desc' as const };
};

const buildJournalInclude = (includeOptions?: JournalIncludeOptions) => {
  if (!includeOptions || includeOptions.length === 0) {
    return undefined;
  }

  return {
    editorInChief: includeOptions.includes('editorInChief'),
  };
};
