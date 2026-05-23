import type { RevisionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Revision, RevisionIncludeOptions } from '@app/domain/entities';

export type GetRevisionParams = [
  id: string,
  includeOptions?: RevisionIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetRevision implements UseCase<Promise<Either<Revision, Error>>, GetRevisionParams> {
  private readonly revisionRepository: RevisionRepository;

  public constructor(@inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository) {
    this.revisionRepository = revisionRepository;
  }

  public async execute(
    id: string,
    includeOptions?: RevisionIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Revision, Error>> {
    return await this.revisionRepository.getRevision(id, includeOptions, abortSignal);
  }
}
