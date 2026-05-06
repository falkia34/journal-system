import { Submission } from './submission.entity';
import { Revision } from './revision.entity';
import { User } from './user.entity';
import { File } from './file.entity';

export class Feedback {
  public constructor(
    public id: string,
    public submissionId: string,
    public revisionId: string,
    public authorId: string,
    public fileId: string | null,
    public content: string,
    public stage: 'Review' | 'Edit' | 'CopyEdit' | 'LayoutEdit' | 'FinalReview',
    public recommendation: 'Continue' | 'Reject' | 'Revise',
    public createdAt: Date,
    public updatedAt: Date,
    public submission?: Submission,
    public revision?: Revision,
    public author?: User,
    public file?: File,
  ) {}
}

export type FeedbackSortOptions = {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
};

export type FeedbackFilterOptions = {
  submissionId?: string;
  revisionId?: string;
  authorId?: string;
  recommendation?: Feedback['recommendation'];
};

export type FeedbackIncludeOptions = Array<'submission' | 'revision' | 'author' | 'file'>;
