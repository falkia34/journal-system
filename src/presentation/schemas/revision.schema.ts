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

export const revisionInputSchema = z.object({
  submissionId: z.uuidv7('Submission must be selected'),
  file: z
    .union([
      z
        .file('File must not be empty')
        .mime(['application/pdf'], 'File must be a PDF file')
        .max(51200 * 1024, 'File must be less than 50MB'),
      z.string(),
    ])
    .nullable(),
  version: z.number('Version must be a number').min(1).optional(),
  startStage: z
    .enum(revisionStageEnum, 'Start stage must be one of the predefined values')
    .optional(),
  currentStage: z
    .enum(revisionStageEnum, 'Current stage must be one of the predefined values')
    .optional(),
  isFrozen: z.boolean().default(false).optional(),
});

export type RevisionInput = z.infer<typeof revisionInputSchema>;
