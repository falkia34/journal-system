import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import type { AuthRepository } from '@app/domain/repositories';

export type LoginParams = [abortSignal?: AbortSignal];

@injectable()
export class Login implements UseCase<Promise<Either<void, Error>>, LoginParams> {
  private readonly authRepository: AuthRepository;

  public constructor(@inject(SYMBOLS.AuthRepository) authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  public async execute(abortSignal?: AbortSignal): Promise<Either<void, Error>> {
    const result = await this.authRepository.signIn(abortSignal);
    if (result._tag === 'Right') {
      return right(undefined);
    }
    return left(result.left);
  }
}
