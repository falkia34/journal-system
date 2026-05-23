import type { PublicationRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Publication } from '@app/domain/entities';

export type DeletePublicationParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeletePublication
  implements UseCase<Promise<Either<Publication, Error>>, DeletePublicationParams>
{
  private readonly publicationRepository: PublicationRepository;

  public constructor(
    @inject(SYMBOLS.PublicationRepository) publicationRepository: PublicationRepository,
  ) {
    this.publicationRepository = publicationRepository;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<Publication, Error>> {
    return await this.publicationRepository.deletePublication(id, abortSignal);
  }
}
