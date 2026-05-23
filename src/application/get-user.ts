import type { UserRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { User } from '@app/domain/entities';

export type GetUserParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class GetUser implements UseCase<Promise<Either<User, Error>>, GetUserParams> {
  private readonly userRepository: UserRepository;

  public constructor(@inject(SYMBOLS.UserRepository) userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<User, Error>> {
    return await this.userRepository.getUser(id, abortSignal);
  }
}
