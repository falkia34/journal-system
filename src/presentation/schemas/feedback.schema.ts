import { z } from 'zod';

const feedbackStageEnum = ['REVIEW', 'EDIT', 'COPY_EDIT', 'LAYOUT_EDIT', 'FINAL_REVIEW'];

const feedbackRecommendationEnum = ['CONTINUE', 'REJECT', 'REVISE'];

export const feedbackInputSchema = z.object({
  submissionId: z.uuidv7('Submission must be selected'),
  revisionId: z.uuidv7('Revision must be selected'),
  authorId: z.uuidv7('Author must be selected'),
  file: z
    .union([
      z
        .file('File must not be empty')
        .mime(['application/pdf'], 'File must be a PDF file')
        .max(51200 * 1024, 'File must be less than 50MB'),
      z.string(),
    ])
    .nullable(),
  content: z.string().min(1, 'Content is required'),
  stage: z.enum(feedbackStageEnum, 'Stage must be one of the predefined values'),
  recommendation: z.enum(
    feedbackRecommendationEnum,
    'Recommendation must be one of the predefined values',
  ),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
