import { z } from 'zod';

const roleEnum = ['AUTHOR', 'REVIEWER', 'EDITOR', 'ADMINISTRATOR'];

export const userInputSchema = z.object({
  name: z.string().min(1, 'Name must not be empty'),
  email: z.email('Email must be valid'),
  roles: z
    .array(z.enum(roleEnum, 'Role must be one of the predefined values'))
    .min(1, 'At least one role must be assigned'),
});

export type UserInput = z.infer<typeof userInputSchema>;
