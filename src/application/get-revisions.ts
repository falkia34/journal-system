import type { RevisionRepository } from '@app/domain/repositories';
import { Either, left, isLeft } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { GetSession } from './get-session';
import {
  Revision,
  PaginationOptions,
  RevisionIncludeOptions,
  RevisionFilterOptions,
  RevisionSortOptions,
} from '@app/domain/entities';

export type GetRevisionsParams = [
  includeOptions?: RevisionIncludeOptions,
  filterOptions?: RevisionFilterOptions,
  sortOptions?: RevisionSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetRevisions
  implements UseCase<Promise<Either<[Revision[], PaginationOptions], Error>>, GetRevisionsParams>
{
  private readonly revisionRepository: RevisionRepository;
  private readonly getSession: GetSession;

  public constructor(
    @inject(SYMBOLS.RevisionRepository) revisionRepository: RevisionRepository,
    @inject(SYMBOLS.GetSession) getSession: GetSession,
  ) {
    this.revisionRepository = revisionRepository;
    this.getSession = getSession;
  }

  public async execute(
    includeOptions?: RevisionIncludeOptions,
    filterOptions?: RevisionFilterOptions,
    sortOptions?: RevisionSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Revision[], PaginationOptions], Error>> {
    const sessionResult = await this.getSession.execute();
    if (isLeft(sessionResult)) return left(sessionResult.left);
    const session = sessionResult.right;

    const role = session.activeRole;
    if (role === 'EDITOR' || role === 'REVIEWER') {
      filterOptions = { ...filterOptions, participantUserId: session.user.id };
    }

    return await this.revisionRepository.getRevisions(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
