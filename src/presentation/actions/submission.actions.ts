'use server';

import {
  CreateSubmission,
  UpdateSubmission,
  DeleteSubmission,
  GetSubmissions,
} from '@app/application';
import { submissionInputSchema } from '@app/presentation/schemas';
import { match } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import { SubmissionDto, SubmissionMapper, PaginationOptionsMapper } from '@app/infrastructure/dtos';
import {
  Submission,
  SubmissionFilterOptions,
  SubmissionIncludeOptions,
} from '@app/domain/entities';

export type SubmissionActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function createSubmissionAction(prevState: SubmissionActionState, formData: FormData) {
  const raw = SubmissionMapper.fromFormDataToDomain(formData);
  const parsed = submissionInputSchema.safeParse(raw);

  if (parsed.success) {
    const createSubmission = serverContainer.get<CreateSubmission>(SYMBOLS.CreateSubmission);
    const result = await createSubmission.execute({
      ...parsed.data,
      status: parsed.data.status as Submission['status'],
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: (submission) => {
        revalidateTag('submissions', 'max');
        redirect(`/submissions/${submission.id}/revisions`);
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        authorId: errors?.authorId?.errors,
        journalId: errors?.journalId?.errors,
        title: errors?.title?.errors,
        abstract: errors?.abstract?.errors,
        authors: errors?.authors?.errors,
      },
    };
  }
}

export async function updateSubmissionAction(prevState: SubmissionActionState, formData: FormData) {
  const raw = SubmissionMapper.fromFormDataToDomain(formData);
  const parsed = submissionInputSchema.safeParse(raw);

  if (parsed.success) {
    const updateSubmission = serverContainer.get<UpdateSubmission>(SYMBOLS.UpdateSubmission);
    const id = raw.id as string;
    const result = await updateSubmission.execute(id, {
      ...parsed.data,
      status: parsed.data.status as Submission['status'],
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('submissions', 'max');
        redirect(`/submissions/${id}/revisions`);
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        authorId: errors?.authorId?.errors,
        journalId: errors?.journalId?.errors,
        title: errors?.title?.errors,
        abstract: errors?.abstract?.errors,
        authors: errors?.authors?.errors,
        status: errors?.status?.errors,
      },
    };
  }
}

export async function deleteSubmissionAction(id: string) {
  const deleteSubmission = serverContainer.get<DeleteSubmission>(SYMBOLS.DeleteSubmission);
  const result = await deleteSubmission.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      revalidateTag('submissions', 'max');
      return null;
    },
  });
}

export async function getSubmissionsAction(
  includes?: SubmissionIncludeOptions,
  filters?: SubmissionFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getSubmissions = serverContainer.get<GetSubmissions>(SYMBOLS.GetSubmissions);
  const result = await getSubmissions.execute(includes, filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([submissions, paginationOptions]) => ({
      submissions: submissions.map(SubmissionMapper.fromDomainToDto) as SubmissionDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}

export async function getAuthorSubmissionsAction(
  includes?: SubmissionIncludeOptions,
  cursor?: string,
  perPage?: number,
) {
  const getSubmissions = serverContainer.get<GetSubmissions>(SYMBOLS.GetSubmissions);
  const result = await getSubmissions.execute(includes, undefined, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([submissions, paginationOptions]) => ({
      submissions: submissions.map(SubmissionMapper.fromDomainToDto) as SubmissionDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
