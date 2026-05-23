import { Submission } from './submission';
import { Feedback } from './feedback';
import { Decision } from './decision';
import { Publication } from './publication';

export type RevisionIncludeOptions = ('submission' | 'feedbacks' | 'decisions' | 'publication')[];

export type RevisionFilterOptions = {
  submissionId?: string;
  isFrozen?: boolean;
  currentStage?: Revision['currentStage'];
  participantUserId?: string;
};

export type RevisionSortOptions = {
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
  version?: 'ASC' | 'DESC';
};

export class Revision {
  public constructor(
    public id: string,
    public submissionId: string,
    public file: File | string | null,
    public version: number,
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
    public currentStage:
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
    public isFrozen: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public submission?: Submission,
    public feedbacks?: Feedback[],
    public decisions?: Decision[],
    public publication?: Publication,
  ) {}
}
