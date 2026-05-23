import { z } from 'zod';

export const issueInputSchema = z.object({
  journalId: z.uuidv7('Journal must be selected'),
  volume: z.number('Volume must be a number').min(1, 'Volume must be at least 1'),
  number: z.number('Number must be a number').min(1, 'Number must be at least 1'),
  title: z.string('Title must be a string').nullable(),
  description: z.string('Description must be a string').nullable(),
  publishedAt: z.date('Published at must be a valid date').nullable(),
});

export type IssueInput = z.infer<typeof issueInputSchema>;
