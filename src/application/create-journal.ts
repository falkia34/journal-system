import type { JournalRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Journal } from '@app/domain/entities';

export type CreateJournalParams = [
  journal: Omit<Journal, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class CreateJournal
  implements UseCase<Promise<Either<Journal, Error>>, CreateJournalParams>
{
  private readonly journalRepository: JournalRepository;

  public constructor(@inject(SYMBOLS.JournalRepository) journalRepository: JournalRepository) {
    this.journalRepository = journalRepository;
  }

  public async execute(
    journal: Omit<Journal, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Journal, Error>> {
    return await this.journalRepository.createJournal(journal, abortSignal);
  }
}
