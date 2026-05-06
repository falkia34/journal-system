import { Either } from 'effect/Either';
import {
  PaginationOptions,
  Publication,
  PublicationFilterOptions,
  PublicationIncludeOptions,
  PublicationSortOptions,
} from '@app/domain/entities';

export interface PublicationRepository {
  getPublications(
    includeOptions?: PublicationIncludeOptions,
    filterOptions?: PublicationFilterOptions,
    sortOptions?: PublicationSortOptions,
    paginationOptions?: PaginationOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<[Publication[], PaginationOptions], Error>>;

  getPublication(
    id: string,
    includeOptions?: PublicationIncludeOptions,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Publication, Error>>;

  createPublication(
    publication: Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Publication, Error>>;

  updatePublication(
    id: string,
    publication: Partial<Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Publication, Error>>;

  deletePublication(
    id: string,
    abortSignal?: AbortSignal,
    token?: string,
  ): Promise<Either<Publication, Error>>;
}
