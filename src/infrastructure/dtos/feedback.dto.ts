import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Feedback } from '@app/domain/entities';
import type { SubmissionDto } from './submission.dto';
import type { RevisionDto } from './revision.dto';
import type { UserDto } from './user.dto';
import { SubmissionMapper } from './submission.dto';
import { RevisionMapper } from './revision.dto';
import { UserMapper } from './user.dto';

export type FeedbackRecord = Prisma.FeedbackGetPayload<object>;

export type FeedbackRecordWithIncludes = Prisma.FeedbackGetPayload<{
  include: {
    submission: true;
    revision: true;
    author: true;
  };
}>;

export interface FeedbackDto {
  id: string;
  submission_id: string;
  revision_id: string;
  author_id: string;
  file: string | null;
  content: string;
  stage: Feedback['stage'];
  recommendation: Feedback['recommendation'];
  created_at: string;
  updated_at: string;
  submission?: SubmissionDto;
  revision?: RevisionDto;
  author?: UserDto;
}

export class FeedbackMapper {
  public static fromPrismaToDomain(payload: FeedbackRecord | FeedbackRecordWithIncludes): Feedback {
    return new Feedback(
      payload.id,
      payload.submissionId,
      payload.revisionId,
      payload.authorId,
      payload.file,
      payload.content,
      payload.stage,
      payload.recommendation,
      payload.createdAt,
      payload.updatedAt,
      'submission' in payload ? SubmissionMapper.fromPrismaToDomain(payload.submission) : undefined,
      'revision' in payload ? RevisionMapper.fromPrismaToDomain(payload.revision) : undefined,
      'author' in payload ? UserMapper.fromPrismaToDomain(payload.author) : undefined,
    );
  }

  public static fromDomainToDto(feedback: Partial<Feedback>): Partial<FeedbackDto> {
    return {
      id: feedback.id,
      submission_id: feedback.submissionId,
      revision_id: feedback.revisionId,
      author_id: feedback.authorId,
      file: feedback.file ?? null,
      content: feedback.content,
      stage: feedback.stage,
      recommendation: feedback.recommendation,
      created_at: feedback.createdAt?.toISOString(),
      updated_at: feedback.updatedAt?.toISOString(),
      submission: feedback.submission
        ? (SubmissionMapper.fromDomainToDto(feedback.submission) as SubmissionDto)
        : undefined,
      revision: feedback.revision
        ? (RevisionMapper.fromDomainToDto(feedback.revision) as RevisionDto)
        : undefined,
      author: feedback.author
        ? (UserMapper.fromDomainToDto(feedback.author) as UserDto)
        : undefined,
    };
  }

  public static fromDtoToDomain(dto: FeedbackDto): Feedback {
    return new Feedback(
      dto.id,
      dto.submission_id,
      dto.revision_id,
      dto.author_id,
      dto.file,
      dto.content,
      dto.stage,
      dto.recommendation,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.submission ? SubmissionMapper.fromDtoToDomain(dto.submission) : undefined,
      dto.revision ? RevisionMapper.fromDtoToDomain(dto.revision) : undefined,
      dto.author ? UserMapper.fromDtoToDomain(dto.author) : undefined,
    );
  }

  public static fromDomainToFormData(feedback: Partial<Feedback>): FormData {
    const formData = new FormData();
    if (feedback.id) formData.append('id', feedback.id);
    if (feedback.submissionId) formData.append('submissionId', feedback.submissionId);
    if (feedback.revisionId) formData.append('revisionId', feedback.revisionId);
    if (feedback.authorId) formData.append('authorId', feedback.authorId);
    if (feedback.file !== undefined) formData.append('file', feedback.file ?? '');
    if (feedback.content) formData.append('content', feedback.content);
    if (feedback.stage) formData.append('stage', feedback.stage);
    if (feedback.recommendation) formData.append('recommendation', feedback.recommendation);
    if (feedback.createdAt) formData.append('createdAt', feedback.createdAt.toISOString());
    if (feedback.updatedAt) formData.append('updatedAt', feedback.updatedAt.toISOString());
    return formData;
  }

  public static fromFormDataToDomain(formData: FormData): Feedback {
    return new Feedback(
      formData.get('id') as string,
      formData.get('submissionId') as string,
      formData.get('revisionId') as string,
      formData.get('authorId') as string,
      formData.get('file') as string,
      formData.get('content') as string,
      formData.get('stage') as Feedback['stage'],
      formData.get('recommendation') as Feedback['recommendation'],
      formData.get('createdAt')
        ? DateTime.fromISO(formData.get('createdAt') as string).toJSDate()
        : new Date(),
      formData.get('updatedAt')
        ? DateTime.fromISO(formData.get('updatedAt') as string).toJSDate()
        : new Date(),
    );
  }
}
