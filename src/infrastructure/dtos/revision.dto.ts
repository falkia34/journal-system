import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Revision } from '@app/domain/entities';
import type { SubmissionDto } from './submission.dto';
import type { FeedbackDto } from './feedback.dto';
import type { DecisionDto } from './decision.dto';
import type { PublicationDto } from './publication.dto';
import { SubmissionMapper } from './submission.dto';
import { FeedbackMapper } from './feedback.dto';
import { DecisionMapper } from './decision.dto';
import { PublicationMapper } from './publication.dto';

export type RevisionRecord = Prisma.RevisionGetPayload<object>;

export type RevisionRecordWithIncludes = Prisma.RevisionGetPayload<{
  include: {
    submission: true;
    feedbacks: true;
    decisions: true;
    publication: true;
  };
}>;

export interface RevisionDto {
  id: string;
  submission_id: string;
  file: File | string | null;
  version: number;
  start_stage: Revision['startStage'];
  current_stage: Revision['currentStage'];
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
  submission?: SubmissionDto;
  feedbacks?: FeedbackDto[];
  decisions?: DecisionDto[];
  publication?: PublicationDto;
}

export class RevisionMapper {
  public static fromPrismaToDomain(payload: RevisionRecord | RevisionRecordWithIncludes): Revision {
    return new Revision(
      payload.id,
      payload.submissionId,
      payload.file,
      payload.version,
      payload.startStage,
      payload.currentStage,
      payload.isFrozen,
      payload.createdAt,
      payload.updatedAt,
      'submission' in payload ? SubmissionMapper.fromPrismaToDomain(payload.submission) : undefined,
      'feedbacks' in payload
        ? payload.feedbacks.map((feedback) => FeedbackMapper.fromPrismaToDomain(feedback))
        : undefined,
      'decisions' in payload
        ? payload.decisions.map((decision) => DecisionMapper.fromPrismaToDomain(decision))
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
      file: revision.file,
      version: revision.version,
      start_stage: revision.startStage,
      current_stage: revision.currentStage,
      is_frozen: revision.isFrozen,
      created_at: revision.createdAt?.toISOString(),
      updated_at: revision.updatedAt?.toISOString(),
      submission: revision.submission
        ? (SubmissionMapper.fromDomainToDto(revision.submission) as SubmissionDto)
        : undefined,
      feedbacks: revision.feedbacks
        ? revision.feedbacks.map(
            (feedback) => FeedbackMapper.fromDomainToDto(feedback) as FeedbackDto,
          )
        : undefined,
      decisions: revision.decisions
        ? revision.decisions.map(
            (decision) => DecisionMapper.fromDomainToDto(decision) as DecisionDto,
          )
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
      dto.file,
      dto.version,
      dto.start_stage,
      dto.current_stage,
      dto.is_frozen,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.submission ? SubmissionMapper.fromDtoToDomain(dto.submission) : undefined,
      dto.feedbacks
        ? dto.feedbacks.map((feedback) => FeedbackMapper.fromDtoToDomain(feedback))
        : undefined,
      dto.decisions
        ? dto.decisions.map((decision) => DecisionMapper.fromDtoToDomain(decision))
        : undefined,
      dto.publication ? PublicationMapper.fromDtoToDomain(dto.publication) : undefined,
    );
  }

  public static fromDomainToFormData(revision: Partial<Revision>): FormData {
    const formData = new FormData();
    if (revision.id) formData.append('id', revision.id);
    if (revision.submissionId) formData.append('submissionId', revision.submissionId);
    if (revision.file !== undefined) formData.append('file', revision.file ?? '');
    if (revision.version) formData.append('version', String(revision.version));
    if (revision.startStage) formData.append('startStage', revision.startStage);
    if (revision.currentStage) formData.append('currentStage', revision.currentStage);
    if (revision.isFrozen !== undefined) formData.append('isFrozen', String(revision.isFrozen));
    if (revision.createdAt) formData.append('createdAt', revision.createdAt.toISOString());
    if (revision.updatedAt) formData.append('updatedAt', revision.updatedAt.toISOString());
    return formData;
  }

  public static fromFormDataToDomain(formData: FormData): Revision {
    const id = formData.get('id') as string | null;
    const submissionId = formData.get('submissionId') as string | null;
    const file = formData.get('file');
    const version = formData.get('version');
    const startStage = formData.get('startStage');
    const currentStage = formData.get('currentStage');
    const isFrozen = formData.get('isFrozen');
    const createdAt = formData.get('createdAt') as string | null;
    const updatedAt = formData.get('updatedAt') as string | null;

    return new Revision(
      id || '',
      submissionId || '',
      file as File | string | null,
      version ? Number(version) : 0,
      (startStage as Revision['startStage']) || 'DRAFT',
      (currentStage as Revision['currentStage']) || 'DRAFT',
      isFrozen === 'true',
      createdAt ? DateTime.fromISO(createdAt).toJSDate() : new Date(),
      updatedAt ? DateTime.fromISO(updatedAt).toJSDate() : new Date(),
    );
  }
}
