'use client';

import Link from 'next/link';
import { AddRounded } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

export function IssuesToolbar() {
  return (
    <Box className="ml-auto">
      <Button
        variant="filled"
        className="ml-4"
        aria-label="Add issue"
        LinkComponent={Link}
        href="/issues/new"
        startIcon={<AddRounded />}
      >
        Add
      </Button>
    </Box>
  );
}
