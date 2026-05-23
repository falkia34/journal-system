'use server';

import {
  CreateFeedback,
  UpdateFeedback,
  DeleteFeedback,
  GetFeedbacks,
  GetSubmission,
} from '@app/application';
import { feedbackInputSchema } from '@app/presentation/schemas';
import { match } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import { FeedbackDto, FeedbackMapper, PaginationOptionsMapper } from '@app/infrastructure/dtos';
import { Feedback, FeedbackFilterOptions, FeedbackIncludeOptions } from '@app/domain/entities';
import { generateFilename, uploadFile } from '@app/utils/file-upload';

export type FeedbackActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function createFeedbackAction(prevState: FeedbackActionState, formData: FormData) {
  const raw = FeedbackMapper.fromFormDataToDomain(formData);
  const parsed = feedbackInputSchema.safeParse(raw);

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

        const generatedFilename = generateFilename(journalName, submissionTitle, 1);

        const uploadResult = await uploadFile(file, 'feedbacks', generatedFilename);
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

    const createFeedback = serverContainer.get<CreateFeedback>(SYMBOLS.CreateFeedback);
    const result = await createFeedback.execute({
      ...parsed.data,
      stage: parsed.data.stage as Feedback['stage'],
      recommendation: parsed.data.recommendation as Feedback['recommendation'],
      file: filename,
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('feedbacks', 'max');
        revalidateTag('submissions', 'max');
        redirect(
          `/submissions/${parsed.data.submissionId}/revisions/${parsed.data.revisionId}/feedbacks`,
        );
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        submissionId: errors?.submissionId?.errors,
        revisionId: errors?.revisionId?.errors,
        authorId: errors?.authorId?.errors,
        file: errors?.file?.errors,
        content: errors?.content?.errors,
        stage: errors?.stage?.errors,
        recommendation: errors?.recommendation?.errors,
      },
    };
  }
}

export async function updateFeedbackAction(prevState: FeedbackActionState, formData: FormData) {
  const raw = FeedbackMapper.fromFormDataToDomain(formData);
  const parsed = feedbackInputSchema.safeParse(raw);

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

        const generatedFilename = generateFilename(journalName, submissionTitle, 1);

        const uploadResult = await uploadFile(file, 'feedbacks', generatedFilename);
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

    const updateFeedback = serverContainer.get<UpdateFeedback>(SYMBOLS.UpdateFeedback);
    const id = raw.id as string;
    const result = await updateFeedback.execute(id, {
      ...parsed.data,
      stage: parsed.data.stage as Feedback['stage'],
      recommendation: parsed.data.recommendation as Feedback['recommendation'],
      file: filename,
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('feedbacks', 'max');
        revalidateTag('submissions', 'max');
        redirect(
          `/submissions/${parsed.data.submissionId}/revisions/${parsed.data.revisionId}/feedbacks`,
        );
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        submissionId: errors?.submissionId?.errors,
        revisionId: errors?.revisionId?.errors,
        authorId: errors?.authorId?.errors,
        file: errors?.file?.errors,
        content: errors?.content?.errors,
        stage: errors?.stage?.errors,
        recommendation: errors?.recommendation?.errors,
      },
    };
  }
}

export async function deleteFeedbackAction(id: string) {
  const deleteFeedback = serverContainer.get<DeleteFeedback>(SYMBOLS.DeleteFeedback);
  const result = await deleteFeedback.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      revalidateTag('feedbacks', 'max');
      revalidateTag('submissions', 'max');
      return null;
    },
  });
}

export async function getFeedbacksAction(
  includes?: FeedbackIncludeOptions,
  filters?: FeedbackFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getFeedbacks = serverContainer.get<GetFeedbacks>(SYMBOLS.GetFeedbacks);
  const result = await getFeedbacks.execute(includes, filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([feedbacks, paginationOptions]) => ({
      feedbacks: feedbacks.map(FeedbackMapper.fromDomainToDto) as FeedbackDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
