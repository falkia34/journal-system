import type { JournalRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Journal } from '@app/domain/entities';

export type DeleteJournalParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeleteJournal
  implements UseCase<Promise<Either<Journal, Error>>, DeleteJournalParams>
{
  private readonly journalRepository: JournalRepository;

  public constructor(@inject(SYMBOLS.JournalRepository) journalRepository: JournalRepository) {
    this.journalRepository = journalRepository;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<Journal, Error>> {
    return await this.journalRepository.deleteJournal(id, abortSignal);
  }
}
