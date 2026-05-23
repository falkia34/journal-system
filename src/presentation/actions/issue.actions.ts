'use server';

import { CreateIssue, UpdateIssue, DeleteIssue, GetIssues } from '@app/application';
import { issueInputSchema } from '@app/presentation/schemas';
import { match } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import { IssueDto, IssueMapper, PaginationOptionsMapper } from '@app/infrastructure/dtos';
import { IssueFilterOptions, IssueIncludeOptions } from '@app/domain/entities';

export type IssueActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function createIssueAction(prevState: IssueActionState, formData: FormData) {
  const raw = IssueMapper.fromFormDataToDomain(formData);
  const parsed = issueInputSchema.safeParse(raw);

  if (parsed.success) {
    const createIssue = serverContainer.get<CreateIssue>(SYMBOLS.CreateIssue);
    const result = await createIssue.execute(parsed.data);

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('issues', 'max');

        redirect('/issues');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        journalId: errors?.journalId?.errors,
        volume: errors?.volume?.errors,
        number: errors?.number?.errors,
        title: errors?.title?.errors,
        description: errors?.description?.errors,
        publishedAt: errors?.publishedAt?.errors,
      },
    };
  }
}

export async function updateIssueAction(prevState: IssueActionState, formData: FormData) {
  const raw = IssueMapper.fromFormDataToDomain(formData);
  const parsed = issueInputSchema.safeParse(raw);

  if (parsed.success) {
    const updateIssue = serverContainer.get<UpdateIssue>(SYMBOLS.UpdateIssue);
    const id = raw.id as string;
    const result = await updateIssue.execute(id, parsed.data);

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('issues', 'max');
        redirect('/issues');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        journalId: errors?.journalId?.errors,
        volume: errors?.volume?.errors,
        number: errors?.number?.errors,
        title: errors?.title?.errors,
        description: errors?.description?.errors,
        publishedAt: errors?.publishedAt?.errors,
      },
    };
  }
}

export async function publishIssueAction(id: string) {
  const updateIssue = serverContainer.get<UpdateIssue>(SYMBOLS.UpdateIssue);
  const result = await updateIssue.execute(id, { publishedAt: new Date() });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: (issue) => {
      revalidateTag('issues', 'max');
      return { issue: IssueMapper.fromDomainToDto(issue) as IssueDto };
    },
  });
}

export async function unpublishIssueAction(id: string) {
  const updateIssue = serverContainer.get<UpdateIssue>(SYMBOLS.UpdateIssue);
  const result = await updateIssue.execute(id, { publishedAt: null });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: (issue) => {
      revalidateTag('issues', 'max');
      return { issue: IssueMapper.fromDomainToDto(issue) as IssueDto };
    },
  });
}

export async function deleteIssueAction(id: string) {
  const deleteIssue = serverContainer.get<DeleteIssue>(SYMBOLS.DeleteIssue);
  const result = await deleteIssue.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      revalidateTag('issues', 'max');
      return null;
    },
  });
}

export async function getIssuesAction(
  includes?: IssueIncludeOptions,
  filters?: IssueFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getIssues = serverContainer.get<GetIssues>(SYMBOLS.GetIssues);
  const result = await getIssues.execute(includes, filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([issues, paginationOptions]) => ({
      issues: issues.map(IssueMapper.fromDomainToDto) as IssueDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
