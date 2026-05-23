import { Submission } from './submission';
import { User } from './user';

export type ParticipantIncludeOptions = ('submission' | 'user')[];

export type ParticipantFilterOptions = {
  submissionId?: string;
  userId?: string;
  stage?: Participant['stage'];
};

export type ParticipantSortOptions = {
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
};

export class Participant {
  public constructor(
    public id: string,
    public submissionId: string,
    public userId: string,
    public stage: 'REVIEW' | 'EDIT' | 'COPY_EDIT' | 'LAYOUT_EDIT' | 'FINAL_REVIEW',
    public createdAt: Date,
    public updatedAt: Date,
    public submission?: Submission,
    public user?: User,
  ) {}
}
