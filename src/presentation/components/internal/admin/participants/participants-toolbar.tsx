'use client';

import { AddRounded } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import Link from 'next/link';
import { useInternalStore } from '@app/presentation/hooks';

type Props = {
  submissionId: string;
};

export function ParticipantsToolbar({ submissionId }: Props) {
  const session = useInternalStore((s) => s.session);
  const isAdmin = session?.activeRole === 'ADMINISTRATOR';

  if (!isAdmin) {
    return null;
  }

  return (
    <Box className="ml-auto flex flex-wrap-reverse justify-end gap-y-2">
      <Button
        variant="filled"
        className="ml-4"
        aria-label="Add participant"
        startIcon={<AddRounded />}
        component={Link}
        href={`/submissions/${submissionId}/participants/new`}
      >
        Add
      </Button>
    </Box>
  );
}
