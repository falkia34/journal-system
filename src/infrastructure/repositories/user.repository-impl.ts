import type { JournalSystemDataSource } from '@app/infrastructure/datasources/server';
import type { UserRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { PaginationOptions, User, UserFilterOptions, UserSortOptions } from '@app/domain/entities';
import { UserMapper } from '@app/infrastructure/dtos';
import { SYMBOLS } from '@config';

@injectable()
export class UserRepositoryImpl implements UserRepository {
  public constructor(
    @inject(SYMBOLS.JournalSystemDataSource)
    private readonly dataSource: JournalSystemDataSource,
  ) {}

  public async getUsers(
    filterOptions?: UserFilterOptions,
    sortOptions?: UserSortOptions,
    paginationOptions?: PaginationOptions,
  ): Promise<Either<[User[], PaginationOptions], Error>> {
    try {
      const take = paginationOptions?.take ?? 25;
      const cursor = paginationOptions?.cursor ? { id: paginationOptions.cursor } : undefined;

      const users = await this.dataSource.user.findMany({
        take: take + 1,
        ...(cursor ? { cursor, skip: 1 } : {}),
        orderBy: this.buildUserOrderBy(sortOptions),
        where: this.buildUserWhere(filterOptions),
      });

      const hasNextPage = users.length > take;
      const items = users.slice(0, take).map((user) => UserMapper.fromPrismaToDomain(user));
      const nextCursor = hasNextPage ? users[take]?.id : undefined;

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

  public async getUser(id: string): Promise<Either<User, Error>> {
    try {
      const user = await this.dataSource.user.findUnique({
        where: { id },
      });

      if (!user) {
        return left(new Error('User not found'));
      }

      return right(UserMapper.fromPrismaToDomain(user));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async createUser(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Either<User, Error>> {
    try {
      const created = await this.dataSource.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          roles: user.roles,
        },
      });

      return right(UserMapper.fromPrismaToDomain(created));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async updateUser(
    id: string,
    user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Either<User, Error>> {
    try {
      const updated = await this.dataSource.user.update({
        where: { id },
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          ...(user.roles ? { roles: { set: user.roles } } : {}),
        },
      });

      return right(UserMapper.fromPrismaToDomain(updated));
    } catch (error) {
      return left(error as Error);
    }
  }

  public async deleteUser(id: string): Promise<Either<User, Error>> {
    try {
      const deleted = await this.dataSource.user.delete({
        where: { id },
      });

      return right(UserMapper.fromPrismaToDomain(deleted));
    } catch (error) {
      return left(error as Error);
    }
  }

  private buildUserWhere = (filterOptions?: UserFilterOptions) => {
    if (!filterOptions) {
      return undefined;
    }

    return {
      ...(filterOptions.name
        ? { name: { contains: filterOptions.name, mode: 'insensitive' as const } }
        : {}),
      ...(filterOptions.email
        ? { email: { contains: filterOptions.email, mode: 'insensitive' as const } }
        : {}),
      ...(filterOptions.role ? { roles: { has: filterOptions.role } } : {}),
    };
  };

  private buildUserOrderBy = (sortOptions?: UserSortOptions) => {
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

    if (sortOptions.email) {
      orderBy.push({ email: sortOptions.email });
    }

    return orderBy.length > 0 ? orderBy : { createdAt: 'desc' as const };
  };
}
