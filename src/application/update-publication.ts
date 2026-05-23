import type { PublicationRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Publication } from '@app/domain/entities';

export type UpdatePublicationParams = [
  id: string,
  publication: Partial<Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>>,
  abortSignal?: AbortSignal,
];

@injectable()
export class UpdatePublication
  implements UseCase<Promise<Either<Publication, Error>>, UpdatePublicationParams>
{
  private readonly publicationRepository: PublicationRepository;

  public constructor(
    @inject(SYMBOLS.PublicationRepository) publicationRepository: PublicationRepository,
  ) {
    this.publicationRepository = publicationRepository;
  }

  public async execute(
    id: string,
    publication: Partial<Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Publication, Error>> {
    return await this.publicationRepository.updatePublication(id, publication, abortSignal);
  }
}
