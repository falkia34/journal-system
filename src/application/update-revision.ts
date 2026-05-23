import type { RevisionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Revision } from '@app/domain/entities';

export type UpdateRevisionParams = [
  id: string,
  revision: Partial<Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>>,
  abortSignal?: AbortSignal,
];

@injectable()
export class UpdateRevision
  implements UseCase<Promise<Either<Revision, Error>>, UpdateRevisionParams>
{
  private readonly revisionRepository: RevisionRepository;

  public constructor(@inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository) {
    this.revisionRepository = revisionRepository;
  }

  public async execute(
    id: string,
    revision: Partial<Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>> {
    return await this.revisionRepository.updateRevision(id, revision, abortSignal);
  }
}
