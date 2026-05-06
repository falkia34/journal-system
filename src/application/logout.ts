import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import type { AuthRepository } from '@app/domain/repositories';

export type LogoutParams = [abortSignal?: AbortSignal];

@injectable()
export class Logout implements UseCase<Promise<Either<void, Error>>, LogoutParams> {
  private readonly authRepository: AuthRepository;

  public constructor(@inject(SYMBOLS.AuthRepository) authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  public async execute(abortSignal?: AbortSignal): Promise<Either<void, Error>> {
    return await this.authRepository.signOut(abortSignal);
  }
}
