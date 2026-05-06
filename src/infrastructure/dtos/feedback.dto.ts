import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Feedback } from '@app/domain/entities';
import type { SubmissionDto } from './submission.dto';
import type { RevisionDto } from './revision.dto';
import type { UserDto } from './user.dto';
import type { FileDto } from './file.dto';
import { SubmissionMapper } from './submission.dto';
import { RevisionMapper } from './revision.dto';
import { UserMapper } from './user.dto';
import { FileMapper } from './file.dto';

export type FeedbackRecord = Prisma.FeedbackGetPayload<object>;

export type FeedbackRecordWithIncludes = Prisma.FeedbackGetPayload<{
  include: {
    submission: true;
    revision: true;
    author: true;
    file: true;
  };
}>;

export interface FeedbackDto {
  id: string;
  submission_id: string;
  revision_id: string;
  author_id: string;
  file_id: string | null;
  content: string;
  stage: Feedback['stage'];
  recommendation: Feedback['recommendation'];
  created_at: string;
  updated_at: string;
  submission?: SubmissionDto;
  revision?: RevisionDto;
  author?: UserDto;
  file?: FileDto;
}

export class FeedbackMapper {
  public static fromPrismaToDomain(payload: FeedbackRecord | FeedbackRecordWithIncludes): Feedback {
    return new Feedback(
      payload.id,
      payload.submissionId,
      payload.revisionId,
      payload.authorId,
      payload.fileId,
      payload.content,
      payload.stage,
      payload.recommendation,
      payload.createdAt,
      payload.updatedAt,
      'submission' in payload ? SubmissionMapper.fromPrismaToDomain(payload.submission) : undefined,
      'revision' in payload ? RevisionMapper.fromPrismaToDomain(payload.revision) : undefined,
      'author' in payload ? UserMapper.fromPrismaToDomain(payload.author) : undefined,
      'file' in payload && payload.file ? FileMapper.fromPrismaToDomain(payload.file) : undefined,
    );
  }

  public static fromDomainToDto(feedback: Partial<Feedback>): Partial<FeedbackDto> {
    return {
      id: feedback.id,
      submission_id: feedback.submissionId,
      revision_id: feedback.revisionId,
      author_id: feedback.authorId,
      file_id: feedback.fileId ?? null,
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
      file: feedback.file ? (FileMapper.fromDomainToDto(feedback.file) as FileDto) : undefined,
    };
  }

  public static fromDtoToDomain(dto: FeedbackDto): Feedback {
    return new Feedback(
      dto.id,
      dto.submission_id,
      dto.revision_id,
      dto.author_id,
      dto.file_id,
      dto.content,
      dto.stage,
      dto.recommendation,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.submission ? SubmissionMapper.fromDtoToDomain(dto.submission) : undefined,
      dto.revision ? RevisionMapper.fromDtoToDomain(dto.revision) : undefined,
      dto.author ? UserMapper.fromDtoToDomain(dto.author) : undefined,
      dto.file ? FileMapper.fromDtoToDomain(dto.file) : undefined,
    );
  }
}
