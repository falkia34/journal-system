'use client';

import { FeedbackInput } from '@app/presentation/schemas';
import { Box, Button } from '@mui/material';
import { RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SaveRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type FormProps = {
  ref: RefObject<HTMLFormElement | null>;
  methods: UseFormReturn<FeedbackInput>;
};

export function FeedbackToolbar({ ref, methods }: FormProps) {
  const router = useRouter();

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
        aria-label="Save feedback"
        startIcon={<SaveRounded />}
        disabled={!isDirty || isSubmitting}
        onClick={() => ref.current?.requestSubmit()}
      >
        Save
      </Button>
    </Box>
  );
}
