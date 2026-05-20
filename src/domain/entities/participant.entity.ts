import { Submission } from './submission.entity';
import { User } from './user.entity';

export class Participant {
  public constructor(
    public id: string,
    public submissionId: string,
    public userId: string,
    public stage: 'Review' | 'Edit' | 'CopyEdit' | 'LayoutEdit' | 'FinalReview',
    public createdAt: Date,
    public updatedAt: Date,
    public submission?: Submission,
    public user?: User,
  ) {}
}
