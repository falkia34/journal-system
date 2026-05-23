# Server Actions

## Overview

All CRUD mutations go through Next.js server actions. This is required because use cases depend on Prisma, which only runs on the server.

## File Structure

One action file per entity in `src/presentation/actions/`:

```
src/presentation/actions/
  journal.actions.ts
  issue.actions.ts
  submission.actions.ts
  revision.actions.ts
  decision.actions.ts
  feedback.actions.ts
  publication.actions.ts
  participant.actions.ts
  user.actions.ts
  file.actions.ts
```

## Action Pattern

```typescript
'use server';

import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { CreateJournal } from '@app/application';
import { match } from 'effect/Either';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { journalCreateSchema } from '@app/presentation/schemas/journal.schema';

export async function createJournalAction(prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = journalCreateSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const useCase = serverContainer.get<CreateJournal>(SYMBOLS.CreateJournal);
  const result = await useCase.execute(parsed.data);

  return match(result, {
    onLeft: (error) => ({ error: (error as Error).message }),
    onRight: () => {
      revalidateTag('journals');
      redirect('/admin/journals');
    },
  });
}
```

## Zod Schemas

Validation schemas live in `src/presentation/schemas/`, one file per entity:

```
src/presentation/schemas/
  journal.schema.ts       — journalCreateSchema, journalUpdateSchema
  issue.schema.ts         — issueCreateSchema, issueUpdateSchema
  submission.schema.ts    — submissionCreateSchema, submissionUpdateSchema
  revision.schema.ts      — revisionCreateSchema, revisionUpdateSchema
  decision.schema.ts      — decisionCreateSchema, decisionUpdateSchema
  feedback.schema.ts      — feedbackCreateSchema, feedbackUpdateSchema
  publication.schema.ts   — publicationCreateSchema, publicationUpdateSchema
  participant.schema.ts   — participantCreateSchema, participantUpdateSchema
  user.schema.ts          — userCreateSchema, userUpdateSchema
  file.schema.ts          — fileCreateSchema
```

**Schema pattern**:

```typescript
import { z } from 'zod';

export const journalCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  issn: z.string().optional(),
  editorInChiefId: z.string().uuid('Select an editor-in-chief'),
});

export const journalUpdateSchema = journalCreateSchema.extend({
  id: z.string().uuid(),
});
```

## Conventions

1. **`'use server'`** directive at the top of every action file
2. **Named exports** for each action function (not default export)
3. **`useActionState`** pattern on the client side for error handling
4. **Zod validation** before use case execution
5. **`revalidateTag()`** after successful mutations to refresh cached data
6. **`redirect()`** after create/update to navigate back to list or detail
7. **Return `{ error }`** object for validation or use case errors
8. **Resolve use cases from `serverContainer`** (not `clientContainer`)
9. **`match()`** from `effect/Either` to handle success/error from use cases

## Cache Tags

Each entity type uses a consistent tag for revalidation:

| Entity | Tag |
|--------|-----|
| Journal | `journals` |
| Issue | `issues` |
| Submission | `submissions` |
| Revision | `revisions` |
| Decision | `decisions` |
| Feedback | `feedbacks` |
| Publication | `publications` |
| Participant | `participants` |
| User | `users` |
| File | `files` |

When a nested entity changes, revalidate the parent tag as well. For example, creating a revision should revalidate both `revisions` and `submissions`.
