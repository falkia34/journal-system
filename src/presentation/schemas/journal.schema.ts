import { z } from 'zod';

export const journalInputSchema = z.object({
  editorInChiefId: z.uuidv7('Editor in chief must be selected'),
  name: z.string().min(1, 'Name must not be empty'),
  description: z.string().min(1, 'Description must not be empty'),
});

export type JournalInput = z.infer<typeof journalInputSchema>;
