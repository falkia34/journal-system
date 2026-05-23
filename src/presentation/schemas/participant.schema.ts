import { z } from 'zod';

const participantStageEnum = ['REVIEW', 'EDIT', 'COPY_EDIT', 'LAYOUT_EDIT', 'FINAL_REVIEW'];

export const participantInputSchema = z.object({
  submissionId: z.uuidv7('Submission must be selected'),
  userId: z.uuidv7('User must be selected'),
  stage: z.enum(participantStageEnum, 'Stage must be one of the predefined values'),
});

export type ParticipantInput = z.infer<typeof participantInputSchema>;
