import type { UserRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { User } from '@app/domain/entities';

export type CreateUserParams = [
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class CreateUser implements UseCase<Promise<Either<User, Error>>, CreateUserParams> {
  private readonly userRepository: UserRepository;

  public constructor(@inject(SYMBOLS.UserRepository) userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<User, Error>> {
    return await this.userRepository.createUser(user, abortSignal);
  }
}
