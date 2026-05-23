import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Participant } from '@app/domain/entities';
import type { SubmissionDto } from './submission.dto';
import type { UserDto } from './user.dto';
import { SubmissionMapper } from './submission.dto';
import { UserMapper } from './user.dto';

export type ParticipantRecord = Prisma.ParticipantGetPayload<object>;

export type ParticipantRecordWithIncludes = Prisma.ParticipantGetPayload<{
  include: {
    submission: true;
    user: true;
  };
}>;

export interface ParticipantDto {
  id: string;
  submission_id: string;
  user_id: string;
  stage: Participant['stage'];
  created_at: string;
  updated_at: string;
  submission?: SubmissionDto;
  user?: UserDto;
}

export class ParticipantMapper {
  public static fromPrismaToDomain(
    payload: ParticipantRecord | ParticipantRecordWithIncludes,
  ): Participant {
    return new Participant(
      payload.id,
      payload.submissionId,
      payload.userId,
      payload.stage as Participant['stage'],
      payload.createdAt,
      payload.updatedAt,
      'submission' in payload ? SubmissionMapper.fromPrismaToDomain(payload.submission) : undefined,
      'user' in payload ? UserMapper.fromPrismaToDomain(payload.user) : undefined,
    );
  }

  public static fromDomainToDto(participant: Partial<Participant>): Partial<ParticipantDto> {
    return {
      id: participant.id,
      submission_id: participant.submissionId,
      user_id: participant.userId,
      stage: participant.stage,
      created_at: participant.createdAt?.toISOString(),
      updated_at: participant.updatedAt?.toISOString(),
      submission: participant.submission
        ? (SubmissionMapper.fromDomainToDto(participant.submission) as SubmissionDto)
        : undefined,
      user: participant.user
        ? (UserMapper.fromDomainToDto(participant.user) as UserDto)
        : undefined,
    };
  }

  public static fromDtoToDomain(dto: ParticipantDto): Participant {
    return new Participant(
      dto.id,
      dto.submission_id,
      dto.user_id,
      dto.stage,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.submission ? SubmissionMapper.fromDtoToDomain(dto.submission) : undefined,
      dto.user ? UserMapper.fromDtoToDomain(dto.user) : undefined,
    );
  }

  public static fromDomainToFormData(participant: Partial<Participant>): FormData {
    const formData = new FormData();
    if (participant.id) formData.append('id', participant.id);
    if (participant.submissionId) formData.append('submissionId', participant.submissionId);
    if (participant.userId) formData.append('userId', participant.userId);
    if (participant.stage) formData.append('stage', participant.stage);
    if (participant.createdAt) formData.append('createdAt', participant.createdAt.toISOString());
    if (participant.updatedAt) formData.append('updatedAt', participant.updatedAt.toISOString());
    return formData;
  }

  public static fromFormDataToDomain(formData: FormData): Participant {
    return new Participant(
      formData.get('id') as string,
      formData.get('submissionId') as string,
      formData.get('userId') as string,
      formData.get('stage') as Participant['stage'],
      formData.get('createdAt')
        ? DateTime.fromISO(formData.get('createdAt') as string).toJSDate()
        : new Date(),
      formData.get('updatedAt')
        ? DateTime.fromISO(formData.get('updatedAt') as string).toJSDate()
        : new Date(),
    );
  }
}
