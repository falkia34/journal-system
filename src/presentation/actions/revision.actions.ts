'use server';

import {
  SubmitRevision,
  UpdateRevision,
  DeleteRevision,
  GetRevisions,
  GetSubmission,
} from '@app/application';
import { revisionInputSchema } from '@app/presentation/schemas';
import { match } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import { RevisionDto, RevisionMapper, PaginationOptionsMapper } from '@app/infrastructure/dtos';
import { Revision, RevisionFilterOptions, RevisionIncludeOptions } from '@app/domain/entities';
import { generateFilename, uploadFile } from '@app/utils/file-upload';

export type RevisionActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function submitRevisionAction(prevState: RevisionActionState, formData: FormData) {
  const raw = RevisionMapper.fromFormDataToDomain(formData);
  const parsed = revisionInputSchema.safeParse(raw);

  if (parsed.success) {
    let filename: string | null = null;

    const file = formData.get('file') as File | null;
    if (file && file instanceof File && file.size > 0) {
      const submissionId = raw.submissionId as string;
      const getSubmission = serverContainer.get<GetSubmission>(SYMBOLS.GetSubmission);
      const submissionResult = await getSubmission.execute(submissionId, ['journal']);

      if (submissionResult._tag === 'Right') {
        const submission = submissionResult.right;
        const journalName = submission.journal?.name || 'journal';
        const submissionTitle = submission.title || 'submission';
        const version = parsed.data.version ?? 1;

        const generatedFilename = generateFilename(journalName, submissionTitle, version);

        const uploadResult = await uploadFile(file, 'revisions', generatedFilename);
        if (uploadResult.success && uploadResult.filename) {
          filename = uploadResult.filename;
        } else {
          return {
            errors: {
              file: [uploadResult.error || 'Failed to upload file'],
            },
          };
        }
      }
    }

    const getSubmissionForStage = serverContainer.get<GetSubmission>(SYMBOLS.GetSubmission);
    const submissionResult = await getSubmissionForStage.execute(raw.submissionId as string, []);
    const submission = submissionResult._tag === 'Right' ? submissionResult.right : null;
    const currentStage = submission?.status ?? 'DRAFT';

    const submitRevision = serverContainer.get<SubmitRevision>(SYMBOLS.SubmitRevision);
    const result = await submitRevision.execute({
      ...parsed.data,
      version: parsed.data.version ?? 1,
      startStage: (parsed.data.startStage as Revision['startStage']) ?? currentStage,
      currentStage: (parsed.data.currentStage as Revision['currentStage']) ?? currentStage,
      isFrozen: parsed.data.isFrozen ?? false,
      file: filename,
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('revisions', 'max');
        revalidateTag('submissions', 'max');
        redirect('/submissions');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        submissionId: errors?.submissionId?.errors,
        file: errors?.file?.errors,
      },
    };
  }
}

export async function updateRevisionAction(prevState: RevisionActionState, formData: FormData) {
  const raw = RevisionMapper.fromFormDataToDomain(formData);
  const parsed = revisionInputSchema.safeParse(raw);

  if (parsed.success) {
    let filename: string | null = null;

    const file = formData.get('file') as File | null;
    if (file && file instanceof File && file.size > 0) {
      const submissionId = raw.submissionId as string;
      const getSubmission = serverContainer.get<GetSubmission>(SYMBOLS.GetSubmission);
      const submissionResult = await getSubmission.execute(submissionId, ['journal']);

      if (submissionResult._tag === 'Right') {
        const submission = submissionResult.right;
        const journalName = submission.journal?.name || 'journal';
        const submissionTitle = submission.title || 'submission';
        const version = parsed.data.version ?? 1;

        const generatedFilename = generateFilename(journalName, submissionTitle, version);

        const uploadResult = await uploadFile(file, 'revisions', generatedFilename);
        if (uploadResult.success && uploadResult.filename) {
          filename = uploadResult.filename;
        } else {
          return {
            errors: {
              file: [uploadResult.error || 'Failed to upload file'],
            },
          };
        }
      }
    } else {
      filename = typeof parsed.data.file === 'string' ? parsed.data.file : null;
    }

    const updateRevision = serverContainer.get<UpdateRevision>(SYMBOLS.UpdateRevision);
    const id = raw.id as string;
    const result = await updateRevision.execute(id, {
      ...parsed.data,
      startStage: parsed.data.startStage as Revision['startStage'],
      currentStage: parsed.data.currentStage as Revision['currentStage'],
      isFrozen: parsed.data.isFrozen ?? false,
      file: filename,
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('revisions', 'max');
        revalidateTag('submissions', 'max');
        redirect('/submissions');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        submissionId: errors?.submissionId?.errors,
        file: errors?.file?.errors,
      },
    };
  }
}

export async function deleteRevisionAction(id: string) {
  const deleteRevision = serverContainer.get<DeleteRevision>(SYMBOLS.DeleteRevision);
  const result = await deleteRevision.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      revalidateTag('revisions', 'max');
      revalidateTag('submissions', 'max');
      return null;
    },
  });
}

export async function getRevisionsAction(
  includes?: RevisionIncludeOptions,
  filters?: RevisionFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getRevisions = serverContainer.get<GetRevisions>(SYMBOLS.GetRevisions);
  const result = await getRevisions.execute(includes, filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([revisions, paginationOptions]) => ({
      revisions: revisions.map(RevisionMapper.fromDomainToDto) as RevisionDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
