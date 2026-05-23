'use client';

import Link from 'next/link';
import { Box, Button } from '@mui/material';
import { EditRounded, SaveRounded } from '@mui/icons-material';
import { RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { ExtendedDecisionFormInput } from './decision-form';

type ViewProps = {
  decisionId: string;
};

type FormProps = {
  ref: RefObject<HTMLFormElement | null>;
  methods: UseFormReturn<ExtendedDecisionFormInput>;
  isPending?: boolean;
};

export function DecisionToolbar({
  decisionId,
  ref,
  methods,
  isPending,
}: OneOf<[ViewProps, FormProps]>) {
  const router = useRouter();

  if (decisionId) {
    return (
      <Box className="ml-auto">
        <Button
          variant="filled"
          className="ml-4"
          aria-label="Edit decision"
          LinkComponent={Link}
          href={`/decisions/${decisionId}/edit`}
          startIcon={<EditRounded />}
        >
          Edit
        </Button>
      </Box>
    );
  } else if (ref && methods) {
    const {
      formState: { isDirty, isSubmitting },
    } = methods;

    return (
      <Box className="ml-auto flex flex-wrap-reverse justify-end gap-y-2">
        <Button
          variant="text"
          className="ml-4"
          aria-label="Cancel"
          disabled={isSubmitting || isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          className="ml-4"
          aria-label="Save decision"
          startIcon={<SaveRounded />}
          disabled={!isDirty || isSubmitting || isPending}
          onClick={() => ref.current?.requestSubmit()}
        >
          Save
        </Button>
      </Box>
    );
  } else {
    return null;
  }
}
