import type { UserRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { User } from '@app/domain/entities';

export type UpdateUserParams = [
  id: string,
  user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
  abortSignal?: AbortSignal,
];

@injectable()
export class UpdateUser implements UseCase<Promise<Either<User, Error>>, UpdateUserParams> {
  private readonly userRepository: UserRepository;

  public constructor(@inject(SYMBOLS.UserRepository) userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(
    id: string,
    user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<User, Error>> {
    return await this.userRepository.updateUser(id, user, abortSignal);
  }
}
