import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Issue } from '@app/domain/entities';
import type { PublicationDto } from './publication.dto';
import type { JournalDto } from './journal.dto';
import { PublicationMapper } from './publication.dto';
import { JournalMapper } from './journal.dto';

export type IssueRecord = Prisma.IssueGetPayload<object>;

export type IssueRecordWithIncludes = Prisma.IssueGetPayload<{
  include: {
    journal: true;
    publications: true;
  };
}>;

export interface IssueDto {
  id: string;
  journal_id: string;
  volume: number;
  number: number;
  title: string | null;
  description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  journal?: JournalDto;
  publications?: PublicationDto[];
}

export class IssueMapper {
  public static fromPrismaToDomain(payload: IssueRecord | IssueRecordWithIncludes): Issue {
    return new Issue(
      payload.id,
      payload.journalId,
      payload.volume,
      payload.number,
      payload.title,
      payload.description,
      payload.publishedAt,
      payload.createdAt,
      payload.updatedAt,
      'journal' in payload ? (payload.journal ?? undefined) : undefined,
      'publications' in payload
        ? payload.publications.map((publication) =>
            PublicationMapper.fromPrismaToDomain(publication),
          )
        : undefined,
    );
  }

  public static fromDomainToDto(issue: Partial<Issue>): Partial<IssueDto> {
    return {
      id: issue.id,
      journal_id: issue.journalId,
      volume: issue.volume,
      number: issue.number,
      title: issue.title ?? null,
      description: issue.description ?? null,
      published_at: issue.publishedAt ? issue.publishedAt.toISOString() : null,
      created_at: issue.createdAt?.toISOString(),
      updated_at: issue.updatedAt?.toISOString(),
      journal: issue.journal
        ? (JournalMapper.fromDomainToDto(issue.journal) as JournalDto)
        : undefined,
      publications: issue.publications
        ? issue.publications.map(
            (publication) => PublicationMapper.fromDomainToDto(publication) as PublicationDto,
          )
        : undefined,
    };
  }

  public static fromDtoToDomain(dto: IssueDto): Issue {
    return new Issue(
      dto.id,
      dto.journal_id,
      dto.volume,
      dto.number,
      dto.title,
      dto.description,
      dto.published_at ? DateTime.fromISO(dto.published_at).toJSDate() : null,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.journal ? JournalMapper.fromDtoToDomain(dto.journal) : undefined,
      dto.publications
        ? dto.publications.map((publication) => PublicationMapper.fromDtoToDomain(publication))
        : undefined,
    );
  }
}
