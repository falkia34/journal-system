import { z } from 'zod';

const revisionStageEnum = [
  'DRAFT',
  'SUBMITTED',
  'REVIEW',
  'EDIT',
  'COPY_EDIT',
  'LAYOUT_EDIT',
  'FINAL_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'WITHDRAWN',
];

export const decisionInputSchema = z.object({
  submissionId: z.uuidv7('Submission must be selected'),
  revisionId: z.uuidv7('Revision must be selected'),
  deciderId: z.uuidv7('Decider must be selected'),
  startStage: z.enum(revisionStageEnum, 'Start stage must be one of the predefined values'),
  decidedStage: z.enum(revisionStageEnum, 'Decided stage must be one of the predefined values'),
  comment: z.string('Comment must be a string').nullable(),
});

export type DecisionInput = z.infer<typeof decisionInputSchema>;
