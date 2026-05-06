import { Submission } from './submission.entity';
import { File } from './file.entity';
import { Feedback } from './feedback.entity';
import { Decision } from './decision.entity';
import { Publication } from './publication.entity';

export class Revision {
  public constructor(
    public id: string,
    public submissionId: string,
    public fileId: string,
    public version: number,
    public startStage:
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
    public currentStage:
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
    public isFrozen: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public submission?: Submission,
    public file?: File,
    public feedbacks?: Feedback[],
    public decision?: Decision,
    public publication?: Publication,
  ) {}
}

export type RevisionSortOptions = {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  version?: 'asc' | 'desc';
};

export type RevisionFilterOptions = {
  submissionId?: string;
  fileId?: string;
  isFrozen?: boolean;
  currentStage?: Revision['currentStage'];
};

export type RevisionIncludeOptions = Array<
  'submission' | 'file' | 'feedbacks' | 'decision' | 'publication'
>;
