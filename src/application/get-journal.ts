import type { JournalRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Journal, JournalIncludeOptions } from '@app/domain/entities';

export type GetJournalParams = [
  id: string,
  includeOptions?: JournalIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetJournal implements UseCase<Promise<Either<Journal, Error>>, GetJournalParams> {
  private readonly journalRepository: JournalRepository;

  public constructor(@inject(SYMBOLS.JournalRepository) journalRepository: JournalRepository) {
    this.journalRepository = journalRepository;
  }

  public async execute(
    id: string,
    includeOptions?: JournalIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Journal, Error>> {
    return await this.journalRepository.getJournal(id, includeOptions, abortSignal);
  }
}
