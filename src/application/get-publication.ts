import type { PublicationRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Publication, PublicationIncludeOptions } from '@app/domain/entities';

export type GetPublicationParams = [
  id: string,
  includeOptions?: PublicationIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetPublication
  implements UseCase<Promise<Either<Publication, Error>>, GetPublicationParams>
{
  private readonly publicationRepository: PublicationRepository;

  public constructor(
    @inject(SYMBOLS.PublicationRepository) publicationRepository: PublicationRepository,
  ) {
    this.publicationRepository = publicationRepository;
  }

  public async execute(
    id: string,
    includeOptions?: PublicationIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Publication, Error>> {
    return await this.publicationRepository.getPublication(id, includeOptions, abortSignal);
  }
}
