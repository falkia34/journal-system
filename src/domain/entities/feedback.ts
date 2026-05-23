import { Submission } from './submission';
import { Revision } from './revision';
import { User } from './user';

export type FeedbackIncludeOptions = ('submission' | 'revision' | 'author')[];

export type FeedbackFilterOptions = {
  submissionId?: string;
  revisionId?: string;
  authorId?: string;
  recommendation?: Feedback['recommendation'];
};

export type FeedbackSortOptions = {
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
};

export class Feedback {
  public constructor(
    public id: string,
    public submissionId: string,
    public revisionId: string,
    public authorId: string,
    public file: string | null,
    public content: string,
    public stage: 'REVIEW' | 'EDIT' | 'COPY_EDIT' | 'LAYOUT_EDIT' | 'FINAL_REVIEW',
    public recommendation: 'CONTINUE' | 'REJECT' | 'REVISE',
    public createdAt: Date,
    public updatedAt: Date,
    public submission?: Submission,
    public revision?: Revision,
    public author?: User,
  ) {}
}
