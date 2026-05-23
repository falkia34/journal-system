'use server';

import {
  CreateParticipant,
  UpdateParticipant,
  DeleteParticipant,
  GetParticipants,
} from '@app/application';
import { participantInputSchema } from '@app/presentation/schemas';
import { match } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import {
  ParticipantDto,
  ParticipantMapper,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import {
  Participant,
  ParticipantFilterOptions,
  ParticipantIncludeOptions,
} from '@app/domain/entities';

export type ParticipantActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function createParticipantAction(
  prevState: ParticipantActionState,
  formData: FormData,
) {
  const raw = ParticipantMapper.fromFormDataToDomain(formData);
  const parsed = participantInputSchema.safeParse(raw);

  if (parsed.success) {
    const createParticipant = serverContainer.get<CreateParticipant>(SYMBOLS.CreateParticipant);
    const result = await createParticipant.execute({
      ...parsed.data,
      stage: parsed.data.stage as Participant['stage'],
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidatePath(`/submissions/${parsed.data.submissionId}/participants`);
        redirect(`/submissions/${parsed.data.submissionId}/participants`);
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        submissionId: errors?.submissionId?.errors,
        userId: errors?.userId?.errors,
        stage: errors?.stage?.errors,
      },
    };
  }
}

export async function updateParticipantAction(
  prevState: ParticipantActionState,
  formData: FormData,
) {
  const raw = ParticipantMapper.fromFormDataToDomain(formData);
  const parsed = participantInputSchema.safeParse(raw);

  if (parsed.success) {
    const updateParticipant = serverContainer.get<UpdateParticipant>(SYMBOLS.UpdateParticipant);
    const id = raw.id as string;
    const result = await updateParticipant.execute(id, {
      ...parsed.data,
      stage: parsed.data.stage as Participant['stage'],
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidatePath(`/submissions/${parsed.data.submissionId}/participants`);
        redirect(`/submissions/${parsed.data.submissionId}/participants`);
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        submissionId: errors?.submissionId?.errors,
        userId: errors?.userId?.errors,
        stage: errors?.stage?.errors,
      },
    };
  }
}

export async function deleteParticipantAction(id: string, submissionId?: string) {
  const deleteParticipant = serverContainer.get<DeleteParticipant>(SYMBOLS.DeleteParticipant);
  const result = await deleteParticipant.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      if (submissionId) {
        revalidatePath(`/submissions/${submissionId}/participants`);
      }
      return null;
    },
  });
}

export async function getParticipantsAction(
  includes?: ParticipantIncludeOptions,
  filters?: ParticipantFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getParticipants = serverContainer.get<GetParticipants>(SYMBOLS.GetParticipants);
  const result = await getParticipants.execute(includes, filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([participants, paginationOptions]) => ({
      participants: participants.map(ParticipantMapper.fromDomainToDto) as ParticipantDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
