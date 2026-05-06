import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Publication } from '@app/domain/entities';
import type { IssueDto } from './issue.dto';
import type { SubmissionDto } from './submission.dto';
import type { RevisionDto } from './revision.dto';
import { IssueMapper } from './issue.dto';
import { SubmissionMapper } from './submission.dto';
import { RevisionMapper } from './revision.dto';

export type PublicationRecord = Prisma.PublicationGetPayload<object>;

export type PublicationRecordWithIncludes = Prisma.PublicationGetPayload<{
  include: {
    issue: true;
    submission: true;
    revision: true;
  };
}>;

export interface PublicationDto {
  id: string;
  issue_id: string;
  submission_id: string;
  revision_id: string;
  doi: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  issue?: IssueDto;
  submission?: SubmissionDto;
  revision?: RevisionDto;
}

export class PublicationMapper {
  public static fromPrismaToDomain(
    payload: PublicationRecord | PublicationRecordWithIncludes,
  ): Publication {
    return new Publication(
      payload.id,
      payload.issueId,
      payload.submissionId,
      payload.revisionId,
      payload.doi,
      payload.publishedAt,
      payload.createdAt,
      payload.updatedAt,
      'issue' in payload ? IssueMapper.fromPrismaToDomain(payload.issue) : undefined,
      'submission' in payload ? SubmissionMapper.fromPrismaToDomain(payload.submission) : undefined,
      'revision' in payload ? RevisionMapper.fromPrismaToDomain(payload.revision) : undefined,
    );
  }

  public static fromDomainToDto(publication: Partial<Publication>): Partial<PublicationDto> {
    return {
      id: publication.id,
      issue_id: publication.issueId,
      submission_id: publication.submissionId,
      revision_id: publication.revisionId,
      doi: publication.doi ?? null,
      published_at: publication.publishedAt?.toISOString(),
      created_at: publication.createdAt?.toISOString(),
      updated_at: publication.updatedAt?.toISOString(),
      issue: publication.issue
        ? (IssueMapper.fromDomainToDto(publication.issue) as IssueDto)
        : undefined,
      submission: publication.submission
        ? (SubmissionMapper.fromDomainToDto(publication.submission) as SubmissionDto)
        : undefined,
      revision: publication.revision
        ? (RevisionMapper.fromDomainToDto(publication.revision) as RevisionDto)
        : undefined,
    };
  }

  public static fromDtoToDomain(dto: PublicationDto): Publication {
    return new Publication(
      dto.id,
      dto.issue_id,
      dto.submission_id,
      dto.revision_id,
      dto.doi,
      DateTime.fromISO(dto.published_at).toJSDate(),
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.issue ? IssueMapper.fromDtoToDomain(dto.issue) : undefined,
      dto.submission ? SubmissionMapper.fromDtoToDomain(dto.submission) : undefined,
      dto.revision ? RevisionMapper.fromDtoToDomain(dto.revision) : undefined,
    );
  }
}
