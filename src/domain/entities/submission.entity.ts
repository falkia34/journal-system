import { Journal } from './journal.entity';
import { User } from './user.entity';

export class Submission {
  public constructor(
    public id: string,
    public authorId: string,
    public journalId: string,
    public title: string,
    public abstract: string,
    public authors: string[],
    public status:
      | 'Draft'
      | 'Submitted'
      | 'Review'
      | 'Edit'
      | 'CopyEdit'
      | 'LayoutEdit'
      | 'FinalReview'
      | 'Published'
      | 'Rejected'
      | 'Withdrawn',
    public createdAt: Date,
    public updatedAt: Date,
    public author?: User,
    public journal?: Journal,
  ) {}
}

export type SubmissionSortOptions = {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  title?: 'asc' | 'desc';
};

export type SubmissionFilterOptions = {
  journalId?: string;
  authorId?: string;
  status?: Submission['status'];
};

export type SubmissionIncludeOptions = Array<'author' | 'journal'>;
