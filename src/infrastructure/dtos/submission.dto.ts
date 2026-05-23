import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Submission } from '@app/domain/entities';
import type { UserDto } from './user.dto';
import type { JournalDto } from './journal.dto';
import type { ParticipantDto } from './participant.dto';
import { UserMapper } from './user.dto';
import { JournalMapper } from './journal.dto';
import { ParticipantMapper } from './participant.dto';

export type SubmissionRecord = Prisma.SubmissionGetPayload<object>;

export type SubmissionRecordWithIncludes = Prisma.SubmissionGetPayload<{
  include: {
    author: true;
    journal: true;
    participants: {
      include: {
        user: true;
      };
    };
  };
}>;

export interface SubmissionDto {
  id: string;
  author_id: string;
  journal_id: string;
  title: string;
  abstract: string;
  authors: string[];
  status: Submission['status'];
  created_at: string;
  updated_at: string;
  author?: UserDto;
  journal?: JournalDto;
  participants?: ParticipantDto[];
}

export class SubmissionMapper {
  public static fromPrismaToDomain(
    payload: SubmissionRecord | SubmissionRecordWithIncludes,
  ): Submission {
    return new Submission(
      payload.id,
      payload.authorId,
      payload.journalId,
      payload.title,
      payload.abstract,
      payload.authors as string[],
      payload.status,
      payload.createdAt,
      payload.updatedAt,
      'author' in payload ? UserMapper.fromPrismaToDomain(payload.author) : undefined,
      'journal' in payload ? JournalMapper.fromPrismaToDomain(payload.journal) : undefined,
      'participants' in payload
        ? payload.participants.map((p) => ParticipantMapper.fromPrismaToDomain(p))
        : undefined,
    );
  }

  public static fromDomainToDto(submission: Partial<Submission>): Partial<SubmissionDto> {
    return {
      id: submission.id,
      author_id: submission.authorId,
      journal_id: submission.journalId,
      title: submission.title,
      abstract: submission.abstract,
      authors: submission.authors,
      status: submission.status,
      created_at: submission.createdAt?.toISOString(),
      updated_at: submission.updatedAt?.toISOString(),
      author: submission.author
        ? (UserMapper.fromDomainToDto(submission.author) as UserDto)
        : undefined,
      journal: submission.journal
        ? (JournalMapper.fromDomainToDto(submission.journal) as JournalDto)
        : undefined,
      participants: submission.participants
        ? submission.participants.map((p) => ParticipantMapper.fromDomainToDto(p) as ParticipantDto)
        : undefined,
    };
  }

  public static fromDtoToDomain(dto: SubmissionDto): Submission {
    return new Submission(
      dto.id,
      dto.author_id,
      dto.journal_id,
      dto.title,
      dto.abstract,
      dto.authors,
      dto.status,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.author ? UserMapper.fromDtoToDomain(dto.author) : undefined,
      dto.journal ? JournalMapper.fromDtoToDomain(dto.journal) : undefined,
      dto.participants
        ? dto.participants.map((p) => ParticipantMapper.fromDtoToDomain(p))
        : undefined,
    );
  }

  public static fromDomainToFormData(submission: Partial<Submission>): FormData {
    const formData = new FormData();
    if (submission.id) formData.append('id', submission.id);
    if (submission.authorId) formData.append('authorId', submission.authorId);
    if (submission.journalId) formData.append('journalId', submission.journalId);
    if (submission.title) formData.append('title', submission.title);
    if (submission.abstract) formData.append('abstract', submission.abstract);
    if (submission.authors) formData.append('authors', JSON.stringify(submission.authors));
    if (submission.status) formData.append('status', submission.status);
    if (submission.createdAt) formData.append('createdAt', submission.createdAt.toISOString());
    if (submission.updatedAt) formData.append('updatedAt', submission.updatedAt.toISOString());
    return formData;
  }

  public static fromFormDataToDomain(formData: FormData): Submission {
    return new Submission(
      formData.get('id') as string,
      formData.get('authorId') as string,
      formData.get('journalId') as string,
      formData.get('title') as string,
      formData.get('abstract') as string,
      JSON.parse(formData.get('authors') as string) as string[],
      formData.get('status') as Submission['status'],
      formData.get('createdAt')
        ? DateTime.fromISO(formData.get('createdAt') as string).toJSDate()
        : new Date(),
      formData.get('updatedAt')
        ? DateTime.fromISO(formData.get('updatedAt') as string).toJSDate()
        : new Date(),
    );
  }
}
