'use server';

import { CreateJournal, UpdateJournal, DeleteJournal, GetJournals } from '@app/application';
import { journalInputSchema } from '@app/presentation/schemas';
import { match } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import { JournalDto, JournalMapper, PaginationOptionsMapper } from '@app/infrastructure/dtos';
import { JournalFilterOptions, JournalIncludeOptions } from '@app/domain/entities';

export type JournalActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function createJournalAction(prevState: JournalActionState, formData: FormData) {
  const raw = JournalMapper.fromFormDataToDomain(formData);
  const parsed = journalInputSchema.safeParse(raw);

  if (parsed.success) {
    const createJournal = serverContainer.get<CreateJournal>(SYMBOLS.CreateJournal);
    const result = await createJournal.execute(parsed.data);

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('journals', 'max');
        redirect('/journals');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        editorInChiefId: errors?.editorInChiefId?.errors,
        name: errors?.name?.errors,
        description: errors?.description?.errors,
      },
    };
  }
}

export async function updateJournalAction(prevState: JournalActionState, formData: FormData) {
  const raw = JournalMapper.fromFormDataToDomain(formData);
  const parsed = journalInputSchema.safeParse(raw);

  if (parsed.success) {
    const updateJournal = serverContainer.get<UpdateJournal>(SYMBOLS.UpdateJournal);
    const id = raw.id as string;
    const result = await updateJournal.execute(id, parsed.data);

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('journals', 'max');
        redirect('/journals');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        editorInChiefId: errors?.editorInChiefId?.errors,
        name: errors?.name?.errors,
        description: errors?.description?.errors,
      },
    };
  }
}

export async function deleteJournalAction(id: string) {
  const deleteJournal = serverContainer.get<DeleteJournal>(SYMBOLS.DeleteJournal);
  const result = await deleteJournal.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      revalidateTag('journals', 'max');
      return null;
    },
  });
}

export async function getJournalsAction(
  includes?: JournalIncludeOptions,
  filters?: JournalFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getJournals = serverContainer.get<GetJournals>(SYMBOLS.GetJournals);
  const result = await getJournals.execute(includes, filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([journals, paginationOptions]) => ({
      journals: journals.map(JournalMapper.fromDomainToDto) as JournalDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
