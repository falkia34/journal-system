import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Revision } from '@app/domain/entities';
import type { SubmissionDto } from './submission.dto';
import type { FileDto } from './file.dto';
import type { FeedbackDto } from './feedback.dto';
import type { DecisionDto } from './decision.dto';
import type { PublicationDto } from './publication.dto';
import { SubmissionMapper } from './submission.dto';
import { FileMapper } from './file.dto';
import { FeedbackMapper } from './feedback.dto';
import { DecisionMapper } from './decision.dto';
import { PublicationMapper } from './publication.dto';

export type RevisionRecord = Prisma.RevisionGetPayload<object>;

export type RevisionRecordWithIncludes = Prisma.RevisionGetPayload<{
  include: {
    submission: true;
    file: true;
    feedbacks: true;
    decision: true;
    publication: true;
  };
}>;

export interface RevisionDto {
  id: string;
  submission_id: string;
  file_id: string;
  version: number;
  start_stage: Revision['startStage'];
  current_stage: Revision['currentStage'];
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
  submission?: SubmissionDto;
  file?: FileDto;
  feedbacks?: FeedbackDto[];
  decision?: DecisionDto;
  publication?: PublicationDto;
}

export class RevisionMapper {
  public static fromPrismaToDomain(payload: RevisionRecord | RevisionRecordWithIncludes): Revision {
    return new Revision(
      payload.id,
      payload.submissionId,
      payload.fileId,
      payload.version,
      payload.startStage,
      payload.currentStage,
      payload.isFrozen,
      payload.createdAt,
      payload.updatedAt,
      'submission' in payload ? SubmissionMapper.fromPrismaToDomain(payload.submission) : undefined,
      'file' in payload && payload.file ? FileMapper.fromPrismaToDomain(payload.file) : undefined,
      'feedbacks' in payload
        ? payload.feedbacks.map((feedback) => FeedbackMapper.fromPrismaToDomain(feedback))
        : undefined,
      'decision' in payload && payload.decision
        ? DecisionMapper.fromPrismaToDomain(payload.decision)
        : undefined,
      'publication' in payload && payload.publication
        ? PublicationMapper.fromPrismaToDomain(payload.publication)
        : undefined,
    );
  }

  public static fromDomainToDto(revision: Partial<Revision>): Partial<RevisionDto> {
    return {
      id: revision.id,
      submission_id: revision.submissionId,
      file_id: revision.fileId,
      version: revision.version,
      start_stage: revision.startStage,
      current_stage: revision.currentStage,
      is_frozen: revision.isFrozen,
      created_at: revision.createdAt?.toISOString(),
      updated_at: revision.updatedAt?.toISOString(),
      submission: revision.submission
        ? (SubmissionMapper.fromDomainToDto(revision.submission) as SubmissionDto)
        : undefined,
      file: revision.file ? (FileMapper.fromDomainToDto(revision.file) as FileDto) : undefined,
      feedbacks: revision.feedbacks
        ? revision.feedbacks.map(
            (feedback) => FeedbackMapper.fromDomainToDto(feedback) as FeedbackDto,
          )
        : undefined,
      decision: revision.decision
        ? (DecisionMapper.fromDomainToDto(revision.decision) as DecisionDto)
        : undefined,
      publication: revision.publication
        ? (PublicationMapper.fromDomainToDto(revision.publication) as PublicationDto)
        : undefined,
    };
  }

  public static fromDtoToDomain(dto: RevisionDto): Revision {
    return new Revision(
      dto.id,
      dto.submission_id,
      dto.file_id,
      dto.version,
      dto.start_stage,
      dto.current_stage,
      dto.is_frozen,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.submission ? SubmissionMapper.fromDtoToDomain(dto.submission) : undefined,
      dto.file ? FileMapper.fromDtoToDomain(dto.file) : undefined,
      dto.feedbacks
        ? dto.feedbacks.map((feedback) => FeedbackMapper.fromDtoToDomain(feedback))
        : undefined,
      dto.decision ? DecisionMapper.fromDtoToDomain(dto.decision) : undefined,
      dto.publication ? PublicationMapper.fromDtoToDomain(dto.publication) : undefined,
    );
  }
}
