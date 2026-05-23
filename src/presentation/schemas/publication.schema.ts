import { z } from 'zod';

export const publicationInputSchema = z.object({
  issueId: z.uuidv7('Issue must be selected'),
  submissionId: z.uuidv7('Submission must be selected'),
  revisionId: z.uuidv7('Revision must be selected'),
  publishedAt: z.date('Published at must be a valid date').nullable(),
});

export type PublicationInput = z.infer<typeof publicationInputSchema>;
