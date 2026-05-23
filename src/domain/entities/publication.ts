import { Issue } from './issue';
import { Revision } from './revision';
import { Submission } from './submission';

export type PublicationIncludeOptions = ('issue' | 'submission' | 'revision')[];

export type PublicationFilterOptions = {
  issueId?: string;
  submissionId?: string;
  revisionId?: string;
};

export type PublicationSortOptions = {
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
  publishedAt?: 'ASC' | 'DESC';
};

export class Publication {
  public constructor(
    public id: string,
    public issueId: string,
    public submissionId: string,
    public revisionId: string,
    public publishedAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
    public issue?: Issue,
    public submission?: Submission,
    public revision?: Revision,
  ) {}
}
