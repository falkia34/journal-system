import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Decision } from '@app/domain/entities';
import type { SubmissionDto } from './submission.dto';
import type { RevisionDto } from './revision.dto';
import type { UserDto } from './user.dto';
import { SubmissionMapper } from './submission.dto';
import { RevisionMapper } from './revision.dto';
import { UserMapper } from './user.dto';

export type DecisionRecord = Prisma.DecisionGetPayload<object>;

export type DecisionRecordWithIncludes = Prisma.DecisionGetPayload<{
  include: {
    submission: true;
    revision: true;
    decider: true;
  };
}>;

export interface DecisionDto {
  id: string;
  submission_id: string;
  revision_id: string;
  decider_id: string;
  start_stage: Decision['startStage'];
  decided_stage: Decision['decidedStage'];
  comment: string | null;
  created_at: string;
  updated_at: string;
  submission?: SubmissionDto;
  revision?: RevisionDto;
  decider?: UserDto;
}

export class DecisionMapper {
  public static fromPrismaToDomain(payload: DecisionRecord | DecisionRecordWithIncludes): Decision {
    return new Decision(
      payload.id,
      payload.submissionId,
      payload.revisionId,
      payload.deciderId,
      payload.startStage,
      payload.decidedStage,
      payload.comment,
      payload.createdAt,
      payload.updatedAt,
      'submission' in payload ? SubmissionMapper.fromPrismaToDomain(payload.submission) : undefined,
      'revision' in payload ? RevisionMapper.fromPrismaToDomain(payload.revision) : undefined,
      'decider' in payload ? UserMapper.fromPrismaToDomain(payload.decider) : undefined,
    );
  }

  public static fromDomainToDto(decision: Partial<Decision>): Partial<DecisionDto> {
    return {
      id: decision.id,
      submission_id: decision.submissionId,
      revision_id: decision.revisionId,
      decider_id: decision.deciderId,
      start_stage: decision.startStage,
      decided_stage: decision.decidedStage,
      comment: decision.comment ?? null,
      created_at: decision.createdAt?.toISOString(),
      updated_at: decision.updatedAt?.toISOString(),
      submission: decision.submission
        ? (SubmissionMapper.fromDomainToDto(decision.submission) as SubmissionDto)
        : undefined,
      revision: decision.revision
        ? (RevisionMapper.fromDomainToDto(decision.revision) as RevisionDto)
        : undefined,
      decider: decision.decider
        ? (UserMapper.fromDomainToDto(decision.decider) as UserDto)
        : undefined,
    };
  }

  public static fromDtoToDomain(dto: DecisionDto): Decision {
    return new Decision(
      dto.id,
      dto.submission_id,
      dto.revision_id,
      dto.decider_id,
      dto.start_stage,
      dto.decided_stage,
      dto.comment,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.submission ? SubmissionMapper.fromDtoToDomain(dto.submission) : undefined,
      dto.revision ? RevisionMapper.fromDtoToDomain(dto.revision) : undefined,
      dto.decider ? UserMapper.fromDtoToDomain(dto.decider) : undefined,
    );
  }

  public static fromDomainToFormData(decision: Partial<Decision>): FormData {
    const formData = new FormData();
    if (decision.id) formData.append('id', decision.id);
    if (decision.submissionId) formData.append('submissionId', decision.submissionId);
    if (decision.revisionId) formData.append('revisionId', decision.revisionId);
    if (decision.deciderId) formData.append('deciderId', decision.deciderId);
    if (decision.startStage) formData.append('startStage', decision.startStage);
    if (decision.decidedStage) formData.append('decidedStage', decision.decidedStage);
    if (decision.comment !== undefined) formData.append('comment', decision.comment ?? '');
    if (decision.createdAt) formData.append('createdAt', decision.createdAt.toISOString());
    if (decision.updatedAt) formData.append('updatedAt', decision.updatedAt.toISOString());
    return formData;
  }

  public static fromFormDataToDomain(formData: FormData): Decision {
    const commentValue = formData.get('comment') as string;
    return new Decision(
      formData.get('id') as string,
      formData.get('submissionId') as string,
      formData.get('revisionId') as string,
      formData.get('deciderId') as string,
      formData.get('startStage') as Decision['startStage'],
      formData.get('decidedStage') as Decision['decidedStage'],
      commentValue || null,
      formData.get('createdAt')
        ? DateTime.fromISO(formData.get('createdAt') as string).toJSDate()
        : new Date(),
      formData.get('updatedAt')
        ? DateTime.fromISO(formData.get('updatedAt') as string).toJSDate()
        : new Date(),
    );
  }
}
