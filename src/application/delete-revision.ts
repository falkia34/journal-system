import type { RevisionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Revision } from '@app/domain/entities';

export type DeleteRevisionParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeleteRevision
  implements UseCase<Promise<Either<Revision, Error>>, DeleteRevisionParams>
{
  private readonly revisionRepository: RevisionRepository;

  public constructor(@inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository) {
    this.revisionRepository = revisionRepository;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<Revision, Error>> {
    return await this.revisionRepository.deleteRevision(id, abortSignal);
  }
}
