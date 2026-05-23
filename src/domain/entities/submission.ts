import { Journal } from './journal';
import { User } from './user';
import { Participant } from './participant';

export type SubmissionIncludeOptions = ('author' | 'journal' | 'participants')[];

export type SubmissionFilterOptions = {
  journalId?: string;
  authorId?: string;
  status?: Submission['status'];
  participantUserId?: string;
  participantStages?: Participant['stage'][];
};

export type SubmissionSortOptions = {
  title?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
};

export class Submission {
  public constructor(
    public id: string,
    public authorId: string,
    public journalId: string,
    public title: string,
    public abstract: string,
    public authors: string[],
    public status:
      | 'DRAFT'
      | 'SUBMITTED'
      | 'REVIEW'
      | 'EDIT'
      | 'COPY_EDIT'
      | 'LAYOUT_EDIT'
      | 'FINAL_REVIEW'
      | 'PUBLISHED'
      | 'REJECTED'
      | 'WITHDRAWN',
    public createdAt: Date,
    public updatedAt: Date,
    public author?: User,
    public journal?: Journal,
    public participants?: Participant[],
  ) {}
}
