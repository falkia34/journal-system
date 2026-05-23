import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import type { AuthRepository } from '@app/domain/repositories';
import { Session } from '@app/domain/entities';

export type UpdateSessionParams = [session: Session];

@injectable()
export class UpdateSession
  implements UseCase<Promise<Either<Session, Error>>, UpdateSessionParams>
{
  private readonly authRepository: AuthRepository;

  public constructor(@inject(SYMBOLS.AuthRepository) authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  public async execute(session: Session): Promise<Either<Session, Error>> {
    return await this.authRepository.updateSession(session);
  }
}
