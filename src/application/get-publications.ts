import type { PublicationRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import {
  Publication,
  PaginationOptions,
  PublicationIncludeOptions,
  PublicationFilterOptions,
  PublicationSortOptions,
} from '@app/domain/entities';

export type GetPublicationsParams = [
  includeOptions?: PublicationIncludeOptions,
  filterOptions?: PublicationFilterOptions,
  sortOptions?: PublicationSortOptions,
  paginationOptions?: PaginationOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetPublications
  implements
    UseCase<Promise<Either<[Publication[], PaginationOptions], Error>>, GetPublicationsParams>
{
  private readonly publicationRepository: PublicationRepository;

  public constructor(
    @inject(SYMBOLS.PublicationRepository) publicationRepository: PublicationRepository,
  ) {
    this.publicationRepository = publicationRepository;
  }

  public async execute(
    includeOptions?: PublicationIncludeOptions,
    filterOptions?: PublicationFilterOptions,
    sortOptions?: PublicationSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<[Publication[], PaginationOptions], Error>> {
    return await this.publicationRepository.getPublications(
      includeOptions,
      filterOptions,
      sortOptions,
      paginationOptions,
      abortSignal,
    );
  }
}
