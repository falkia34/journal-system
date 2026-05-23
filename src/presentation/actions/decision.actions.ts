'use server';

import {
  CreateDecision,
  UpdateDecision,
  DeleteDecision,
  GetDecisions,
  GetSession,
} from '@app/application';
import { decisionInputSchema } from '@app/presentation/schemas';
import { match, isLeft } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import { DecisionDto, DecisionMapper, PaginationOptionsMapper } from '@app/infrastructure/dtos';
import { Decision, DecisionFilterOptions, DecisionIncludeOptions } from '@app/domain/entities';

export type DecisionActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function createDecisionAction(prevState: DecisionActionState, formData: FormData) {
  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();

  if (isLeft(sessionResult) || sessionResult.right.activeRole !== 'ADMINISTRATOR') {
    return { errors: { message: ['Unauthorized'] } };
  }
  const session = sessionResult.right;

  const raw = DecisionMapper.fromFormDataToDomain(formData);
  raw.deciderId = session.user.id;
  const parsed = decisionInputSchema.safeParse(raw);

  if (parsed.success) {
    const isFrozen = formData.get('isFrozen') === 'true';
    const issueId = formData.get('issueId')?.toString() || undefined;

    const createDecision = serverContainer.get<CreateDecision>(SYMBOLS.CreateDecision);
    const result = await createDecision.execute(
      {
        ...parsed.data,
        startStage: parsed.data.startStage as Decision['startStage'],
        decidedStage: parsed.data.decidedStage as Decision['decidedStage'],
      },
      isFrozen,
      issueId,
    );

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('decisions', 'max');
        revalidateTag('submissions', 'max');
        redirect('/submissions');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        submissionId: errors?.submissionId?.errors,
        revisionId: errors?.revisionId?.errors,
        startStage: errors?.startStage?.errors,
        decidedStage: errors?.decidedStage?.errors,
        comment: errors?.comment?.errors,
      },
    };
  }
}

export async function updateDecisionAction(prevState: DecisionActionState, formData: FormData) {
  const raw = DecisionMapper.fromFormDataToDomain(formData);
  const parsed = decisionInputSchema.safeParse(raw);

  if (parsed.success) {
    const updateDecision = serverContainer.get<UpdateDecision>(SYMBOLS.UpdateDecision);
    const id = raw.id as string;
    const result = await updateDecision.execute(id, {
      ...parsed.data,
      startStage: parsed.data.startStage as Decision['startStage'],
      decidedStage: parsed.data.decidedStage as Decision['decidedStage'],
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('decisions', 'max');
        revalidateTag('submissions', 'max');
        redirect('/submissions');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        submissionId: errors?.submissionId?.errors,
        revisionId: errors?.revisionId?.errors,
        deciderId: errors?.deciderId?.errors,
        startStage: errors?.startStage?.errors,
        decidedStage: errors?.decidedStage?.errors,
        comment: errors?.comment?.errors,
      },
    };
  }
}

export async function deleteDecisionAction(id: string) {
  const deleteDecision = serverContainer.get<DeleteDecision>(SYMBOLS.DeleteDecision);
  const result = await deleteDecision.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      revalidateTag('decisions', 'max');
      revalidateTag('submissions', 'max');
      return null;
    },
  });
}

export async function getDecisionsAction(
  includes?: DecisionIncludeOptions,
  filters?: DecisionFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getDecisions = serverContainer.get<GetDecisions>(SYMBOLS.GetDecisions);
  const result = await getDecisions.execute(includes, filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([decisions, paginationOptions]) => ({
      decisions: decisions.map(DecisionMapper.fromDomainToDto) as DecisionDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
