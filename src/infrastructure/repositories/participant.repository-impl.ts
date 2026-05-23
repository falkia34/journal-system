import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { ParticipantRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import {
  PaginationOptions,
  Participant,
  ParticipantFilterOptions,
  ParticipantIncludeOptions,
  ParticipantSortOptions,
} from '@app/domain/entities';
import { ParticipantMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class ParticipantRepositoryImpl implements ParticipantRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getParticipants(
    includeOptions?: ParticipantIncludeOptions,
    filterOptions?: ParticipantFilterOptions,
    sortOptions?: ParticipantSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[Participant[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const participants = await this.dataSource.participant.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: buildParticipantOrderBy(sortOptions),
        where: buildParticipantWhere(filterOptions),
        include: buildParticipantInclude(includeOptions),
      });

      const hasNextPage = participants.length > take;
      const items = participants
        .slice(0, take)
        .map((participant) => ParticipantMapper.fromPrismaToDomain(participant));
      const nextCursor = hasNextPage ? participants[take]?.id : undefined;

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

  public async getParticipant(
    id: string,
    includeOptions?: ParticipantIncludeOptions,
  ): Promise<Either<Participant, Error>> {
    try {
      const participant = await this.dataSource.participant.findUnique({
        where: { id },
        include: buildParticipantInclude(includeOptions),
      });

      if (!participant) {
        return left(new Error('Participant not found'));
      }

      return right(ParticipantMapper.fromPrismaToDomain(participant));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createParticipant(
    participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<Participant, Error>> {
    try {
      const created = await this.dataSource.participant.create({
        data: {
          submissionId: participant.submissionId,
          userId: participant.userId,
          stage: participant.stage,
        },
        include: buildParticipantInclude(['submission', 'user']),
      });

      return right(ParticipantMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updateParticipant(
    id: string,
    participant: Partial<Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<Participant, Error>> {
    try {
      const updated = await this.dataSource.participant.update({
        where: { id },
        data: {
          submissionId: participant.submissionId,
          userId: participant.userId,
          stage: participant.stage,
        },
        include: buildParticipantInclude(['submission', 'user']),
      });

      return right(ParticipantMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deleteParticipant(id: string): Promise<Either<Participant, Error>> {
    try {
      const deleted = await this.dataSource.participant.delete({
        where: { id },
        include: buildParticipantInclude(['submission', 'user']),
      });

      return right(ParticipantMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }
}

const buildParticipantWhere = (filterOptions?: ParticipantFilterOptions) => {
  if (!filterOptions) {
    return undefined;
  }

  return {
    ...(filterOptions.submissionId ? { submissionId: filterOptions.submissionId } : {}),
    ...(filterOptions.userId ? { userId: filterOptions.userId } : {}),
    ...(filterOptions.stage ? { stage: filterOptions.stage } : {}),
  };
};

const buildParticipantOrderBy = (sortOptions?: ParticipantSortOptions) => {
  if (!sortOptions) {
    return { createdAt: 'desc' as const };
  }

  const orderBy: Array<Record<string, 'ASC' | 'DESC'>> = [];

  if (sortOptions.createdAt) {
    orderBy.push({ createdAt: sortOptions.createdAt });
  }

  if (sortOptions.updatedAt) {
    orderBy.push({ updatedAt: sortOptions.updatedAt });
  }

  return orderBy.length > 0 ? orderBy : { createdAt: 'desc' as const };
};

const buildParticipantInclude = (includeOptions?: ParticipantIncludeOptions) => {
  if (!includeOptions || includeOptions.length === 0) {
    return undefined;
  }

  return {
    submission: includeOptions.includes('submission'),
    user: includeOptions.includes('user'),
  };
};
