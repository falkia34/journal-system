import { Either } from 'effect/Either';
import { PaginationOptions, User, UserFilterOptions, UserSortOptions } from '@app/domain/entities';

export interface UserRepository {
  getUsers(
    filterOptions?: UserFilterOptions,
    sortOptions?: UserSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[User[], PaginationOptions], Error>>;

  getUser(id: string, abortSignal?: AbortSignal): Promise<Either<User, Error>>;

  createUser(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<User, Error>>;

  updateUser(
    id: string,
    user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<User, Error>>;

  deleteUser(id: string, abortSignal?: AbortSignal): Promise<Either<User, Error>>;
}
