'use client';

import Link from 'next/link';
import { SubmissionInput } from '@app/presentation/schemas';
import { Box, Button } from '@mui/material';
import { RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EditRounded, SaveRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type ViewProps = {
  submissionId: string;
  status?: string;
};

type FormProps = {
  ref: RefObject<HTMLFormElement | null>;
  methods: UseFormReturn<SubmissionInput>;
};

export function SubmissionToolbar({
  submissionId,
  status,
  ref,
  methods,
}: OneOf<[ViewProps, FormProps]>) {
  const router = useRouter();

  if (submissionId) {
    const isPublished = status === 'PUBLISHED';
    return (
      <Box className="ml-auto">
        {!isPublished && (
          <Button
            variant="filled"
            className="ml-4"
            aria-label="Edit submission"
            LinkComponent={Link}
            href={`/submissions/${submissionId}/edit`}
            startIcon={<EditRounded />}
          >
            Edit
          </Button>
        )}
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
          disabled={isSubmitting}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          className="ml-4"
          aria-label="Save submission"
          startIcon={<SaveRounded />}
          disabled={!isDirty || isSubmitting}
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
