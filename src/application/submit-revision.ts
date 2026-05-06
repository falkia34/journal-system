import type { RevisionRepository, AuthRepository } from '@app/domain/repositories';
import { Either, left, isRight } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Revision } from '@app/domain/entities';

export type SubmitRevisionParams = [
  revision: Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class SubmitRevision
  implements UseCase<Promise<Either<Revision, Error>>, SubmitRevisionParams>
{
  private readonly revisionRepository: RevisionRepository;
  private readonly authRepository: AuthRepository;

  public constructor(
    @inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository,
    @inject(SYMBOLS.AuthRepository) authRepository: AuthRepository,
  ) {
    this.revisionRepository = revisionRepository;
    this.authRepository = authRepository;
  }

  public async execute(
    revision: Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>> {
    const accessTokenResult = await this.authRepository.getAccessToken();

    if (isRight(accessTokenResult)) {
      return await this.revisionRepository.createRevision(
        revision,
        abortSignal,
        accessTokenResult.right,
      );
    } else {
      return left(accessTokenResult.left);
    }
  }
}
