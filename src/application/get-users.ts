import type { UserRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { User, PaginationOptions, UserFilterOptions, UserSortOptions } from '@app/domain/entities';

export type GetUsersParams = [
  filterOptions?: UserFilterOptions,
  sortOptions?: UserSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetUsers
  implements UseCase<Promise<Either<[User[], PaginationOptions], Error>>, GetUsersParams>
{
  private readonly userRepository: UserRepository;

  public constructor(@inject(SYMBOLS.UserRepository) userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(
    filterOptions?: UserFilterOptions,
    sortOptions?: UserSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[User[], PaginationOptions], Error>> {
    return await this.userRepository.getUsers(
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
