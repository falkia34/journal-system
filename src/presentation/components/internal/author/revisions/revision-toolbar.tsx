'use client';

import { FactCheckRounded, SaveRounded } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { RevisionInput } from '@app/presentation/schemas';
import type { RevisionDto } from '@app/infrastructure/dtos';
import Link from 'next/link';

type Props = {
  // Form mode
  ref?: RefObject<HTMLFormElement | null>;
  methods?: UseFormReturn<RevisionInput>;

  // View mode
  role?: string;
  revision?: RevisionDto;
  submissionId?: string;
};

export function RevisionToolbar({ ref, methods, role, revision, submissionId }: Props) {
  const router = useRouter();

  const canCreateDecision = role === 'ADMINISTRATOR' && revision && !revision.is_frozen;

  if (methods && ref) {
    const {
      formState: { isDirty, isSubmitting },
    } = methods;

    return (
      <Box className="ml-auto flex flex-wrap-reverse justify-end gap-y-2">
        <Button
          variant="text"
          className="ml-4"
          aria-label="Cancel"
          disabled={isSubmitting}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          className="ml-4"
          aria-label="Save revision"
          startIcon={<SaveRounded />}
          disabled={!isDirty || isSubmitting}
          onClick={() => ref.current?.requestSubmit()}
        >
          Save
        </Button>
      </Box>
    );
  } else if (canCreateDecision) {
    return (
      <Box className="ml-auto flex flex-wrap-reverse justify-end gap-y-2">
        <Button
          variant="filled"
          className="ml-4"
          aria-label="Decide"
          startIcon={<FactCheckRounded />}
          LinkComponent={Link}
          href={`/submissions/${submissionId}/revisions/${revision.id}/decisions/create`}
        >
          Decide
        </Button>
      </Box>
    );
  }
}
