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
  published_at: string | null;
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
      dto.published_at ? DateTime.fromISO(dto.published_at).toJSDate() : null,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.issue ? IssueMapper.fromDtoToDomain(dto.issue) : undefined,
      dto.submission ? SubmissionMapper.fromDtoToDomain(dto.submission) : undefined,
      dto.revision ? RevisionMapper.fromDtoToDomain(dto.revision) : undefined,
    );
  }

  public static fromDomainToFormData(publication: Partial<Publication>): FormData {
    const formData = new FormData();
    if (publication.id) formData.append('id', publication.id);
    if (publication.issueId) formData.append('issueId', publication.issueId);
    if (publication.submissionId) formData.append('submissionId', publication.submissionId);
    if (publication.revisionId) formData.append('revisionId', publication.revisionId);
    if (publication.publishedAt !== undefined)
      formData.append('publishedAt', publication.publishedAt?.toISOString() ?? '');
    if (publication.createdAt) formData.append('createdAt', publication.createdAt.toISOString());
    if (publication.updatedAt) formData.append('updatedAt', publication.updatedAt.toISOString());
    return formData;
  }

  public static fromFormDataToDomain(formData: FormData): Publication {
    const publishedAtValue = formData.get('publishedAt') as string;
    return new Publication(
      formData.get('id') as string,
      formData.get('issueId') as string,
      formData.get('submissionId') as string,
      formData.get('revisionId') as string,
      publishedAtValue ? DateTime.fromISO(publishedAtValue).toJSDate() : null,
      formData.get('createdAt')
        ? DateTime.fromISO(formData.get('createdAt') as string).toJSDate()
        : new Date(),
      formData.get('updatedAt')
        ? DateTime.fromISO(formData.get('updatedAt') as string).toJSDate()
        : new Date(),
    );
  }
}
