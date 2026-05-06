import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Submission } from '@app/domain/entities';
import type { UserDto } from './user.dto';
import type { JournalDto } from './journal.dto';
import { UserMapper } from './user.dto';
import { JournalMapper } from './journal.dto';

export type SubmissionRecord = Prisma.SubmissionGetPayload<object>;

export type SubmissionRecordWithIncludes = Prisma.SubmissionGetPayload<{
  include: {
    author: true;
    journal: true;
  };
}>;

export interface SubmissionDto {
  id: string;
  author_id: string;
  journal_id: string;
  title: string;
  abstract: string;
  status: Submission['status'];
  created_at: string;
  updated_at: string;
  author?: UserDto;
  journal?: JournalDto;
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
      payload.status,
      payload.createdAt,
      payload.updatedAt,
      'author' in payload ? UserMapper.fromPrismaToDomain(payload.author) : undefined,
      'journal' in payload ? JournalMapper.fromPrismaToDomain(payload.journal) : undefined,
    );
  }

  public static fromDomainToDto(submission: Partial<Submission>): Partial<SubmissionDto> {
    return {
      id: submission.id,
      author_id: submission.authorId,
      journal_id: submission.journalId,
      title: submission.title,
      abstract: submission.abstract,
      status: submission.status,
      created_at: submission.createdAt?.toISOString(),
      updated_at: submission.updatedAt?.toISOString(),
      author: submission.author
        ? (UserMapper.fromDomainToDto(submission.author) as UserDto)
        : undefined,
      journal: submission.journal
        ? (JournalMapper.fromDomainToDto(submission.journal) as JournalDto)
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
      dto.status,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.author ? UserMapper.fromDtoToDomain(dto.author) : undefined,
      dto.journal ? JournalMapper.fromDtoToDomain(dto.journal) : undefined,
    );
  }
}
