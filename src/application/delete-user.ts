import type { UserRepository } from '@app/domain/repositories';
import { Either, left, isLeft } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { GetSession } from './get-session';
import { User } from '@app/domain/entities';

export type DeleteUserParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeleteUser implements UseCase<Promise<Either<User, Error>>, DeleteUserParams> {
  private readonly userRepository: UserRepository;
  private readonly getSession: GetSession;

  public constructor(
    @inject(SYMBOLS.UserRepository) userRepository: UserRepository,
    @inject(SYMBOLS.GetSession) getSession: GetSession,
  ) {
    this.userRepository = userRepository;
    this.getSession = getSession;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<User, Error>> {
    const sessionResult = await this.getSession.execute();
    if (isLeft(sessionResult)) return left(sessionResult.left);

    if (sessionResult.right.activeRole !== 'ADMINISTRATOR') {
      return left(new Error('Only Administrators can delete users'));
    }

    return await this.userRepository.deleteUser(id, abortSignal);
  }
}
