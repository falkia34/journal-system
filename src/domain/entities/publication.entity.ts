import { Issue } from './issue.entity';
import { Revision } from './revision.entity';
import { Submission } from './submission.entity';

export class Publication {
  public constructor(
    public id: string,
    public issueId: string,
    public submissionId: string,
    public revisionId: string,
    public doi: string | null,
    public publishedAt: Date,
    public createdAt: Date,
    public updatedAt: Date,
    public issue?: Issue,
    public submission?: Submission,
    public revision?: Revision,
  ) {}
}

export type PublicationSortOptions = {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  publishedAt?: 'asc' | 'desc';
};

export type PublicationFilterOptions = {
  issueId?: string;
  submissionId?: string;
  revisionId?: string;
};

export type PublicationIncludeOptions = Array<'issue' | 'submission' | 'revision'>;
