'use client';

import Link from 'next/link';
import { Box, Button } from '@mui/material';
import { EditRounded, SaveRounded } from '@mui/icons-material';
import { RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { JournalDto } from '@app/infrastructure/dtos';
import { JournalInput } from '@app/presentation/schemas';
import { useRouter } from 'next/navigation';

type ViewProps = { journalId: string; formRef?: never; methods?: never };
type FormProps = {
  formRef: RefObject<HTMLFormElement | null>;
  methods: UseFormReturn<JournalInput>;
  initialJournal?: JournalDto;
  journalId?: never;
};

export function JournalToolbar(props: ViewProps | FormProps) {
  const router = useRouter();

  if ('journalId' in props && props.journalId) {
    return (
      <Box className="ml-auto">
        <Button
          variant="filled"
          className="ml-4"
          aria-label="Edit journal"
          LinkComponent={Link}
          href={`/journals/${props.journalId}/edit`}
          startIcon={<EditRounded />}
        >
          Edit
        </Button>
      </Box>
    );
  }

  if ('formRef' in props && props.formRef && props.methods) {
    const {
      formState: { isDirty, isSubmitting },
    } = props.methods;
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
          aria-label="Save journal"
          startIcon={<SaveRounded />}
          disabled={!isDirty || isSubmitting}
          onClick={() => (props.formRef as RefObject<HTMLFormElement>).current?.requestSubmit()}
        >
          Save
        </Button>
      </Box>
    );
  }

  return null;
}
