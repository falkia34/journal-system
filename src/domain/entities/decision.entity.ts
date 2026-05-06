import { Submission } from './submission.entity';
import { Revision } from './revision.entity';
import { User } from './user.entity';

export class Decision {
  public constructor(
    public id: string,
    public submissionId: string,
    public revisionId: string,
    public deciderId: string,
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
    public decidedStage:
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
    public comment: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public submission?: Submission,
    public revision?: Revision,
    public decider?: User,
  ) {}
}

export type DecisionSortOptions = {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
};

export type DecisionFilterOptions = {
  submissionId?: string;
  revisionId?: string;
  deciderId?: string;
};

export type DecisionIncludeOptions = Array<'submission' | 'revision' | 'decider'>;
