import { z } from 'zod';

const submissionStatusEnum = [
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

export const submissionInputSchema = z.object({
  authorId: z.uuidv7('Author must be selected'),
  journalId: z.uuidv7('Journal must be selected'),
  title: z.string().min(1, 'Title must not be empty'),
  abstract: z.string().min(1, 'Abstract must not be empty'),
  authors: z
    .array(z.string().min(1, 'Author name must not be empty'))
    .min(1, 'At least one author is required'),
  status: z.enum(submissionStatusEnum, 'Status must be one of the predefined values'),
});

export type SubmissionInput = z.infer<typeof submissionInputSchema>;
