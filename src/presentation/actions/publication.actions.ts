'use server';

import {
  CreatePublication,
  UpdatePublication,
  DeletePublication,
  GetPublications,
} from '@app/application';
import { publicationInputSchema } from '@app/presentation/schemas';
import { match } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import {
  PublicationDto,
  PublicationMapper,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { PublicationFilterOptions, PublicationIncludeOptions } from '@app/domain/entities';

export type PublicationActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function createPublicationAction(
  prevState: PublicationActionState,
  formData: FormData,
) {
  const raw = PublicationMapper.fromFormDataToDomain(formData);
  const parsed = publicationInputSchema.safeParse(raw);

  if (parsed.success) {
    const createPublication = serverContainer.get<CreatePublication>(SYMBOLS.CreatePublication);
    const result = await createPublication.execute(parsed.data);

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('publications', 'max');
        revalidateTag('issues', 'max');
        redirect('/publications');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        issueId: errors?.issueId?.errors,
        submissionId: errors?.submissionId?.errors,
        revisionId: errors?.revisionId?.errors,
        publishedAt: errors?.publishedAt?.errors,
      },
    };
  }
}

export async function updatePublicationAction(
  prevState: PublicationActionState,
  formData: FormData,
) {
  const raw = PublicationMapper.fromFormDataToDomain(formData);
  const parsed = publicationInputSchema.safeParse(raw);

  if (parsed.success) {
    const updatePublication = serverContainer.get<UpdatePublication>(SYMBOLS.UpdatePublication);
    const id = raw.id as string;
    const result = await updatePublication.execute(id, parsed.data);

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('publications', 'max');
        revalidateTag('issues', 'max');
        redirect('/publications');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        issueId: errors?.issueId?.errors,
        submissionId: errors?.submissionId?.errors,
        revisionId: errors?.revisionId?.errors,
        publishedAt: errors?.publishedAt?.errors,
      },
    };
  }
}

export async function deletePublicationAction(id: string) {
  const deletePublication = serverContainer.get<DeletePublication>(SYMBOLS.DeletePublication);
  const result = await deletePublication.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      revalidateTag('publications', 'max');
      revalidateTag('issues', 'max');
      return null;
    },
  });
}

export async function getPublicationsAction(
  includes?: PublicationIncludeOptions,
  filters?: PublicationFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getPublications = serverContainer.get<GetPublications>(SYMBOLS.GetPublications);
  const result = await getPublications.execute(includes, filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([publications, paginationOptions]) => ({
      publications: publications.map(PublicationMapper.fromDomainToDto) as PublicationDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
