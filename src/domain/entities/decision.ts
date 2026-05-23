import { Submission } from './submission';
import { Revision } from './revision';
import { User } from './user';

export type DecisionIncludeOptions = ('submission' | 'revision' | 'decider')[];

export type DecisionFilterOptions = {
  submissionId?: string;
  revisionId?: string;
  deciderId?: string;
};

export type DecisionSortOptions = {
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
};

export class Decision {
  public constructor(
    public id: string,
    public submissionId: string,
    public revisionId: string,
    public deciderId: string,
    public startStage:
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
    public decidedStage:
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
    public comment: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public submission?: Submission,
    public revision?: Revision,
    public decider?: User,
  ) {}
}
