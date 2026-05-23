import { z } from 'zod';

export const profileInputSchema = z.object({
  name: z.string().min(1, 'Name must not be empty'),
  email: z.email('Email must be valid'),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
