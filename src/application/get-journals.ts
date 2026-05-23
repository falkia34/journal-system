import type { JournalRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import {
  Journal,
  PaginationOptions,
  JournalIncludeOptions,
  JournalFilterOptions,
  JournalSortOptions,
} from '@app/domain/entities';

export type GetJournalsParams = [
  includeOptions?: JournalIncludeOptions,
  filterOptions?: JournalFilterOptions,
  sortOptions?: JournalSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetJournals
  implements UseCase<Promise<Either<[Journal[], PaginationOptions], Error>>, GetJournalsParams>
{
  private readonly journalRepository: JournalRepository;

  public constructor(@inject(SYMBOLS.JournalRepository) journalRepository: JournalRepository) {
    this.journalRepository = journalRepository;
  }

  public async execute(
    includeOptions?: JournalIncludeOptions,
    filterOptions?: JournalFilterOptions,
    sortOptions?: JournalSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Journal[], PaginationOptions], Error>> {
    return await this.journalRepository.getJournals(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
