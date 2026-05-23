'use client';

import { Box, Button } from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import Link from 'next/link';

export function UsersToolbar() {
  return (
    <Box className="ml-auto">
      <Button
        variant="filled"
        className="ml-4"
        aria-label="Add user"
        LinkComponent={Link}
        href="/users/new"
        startIcon={<AddRounded />}
      >
        Add
      </Button>
    </Box>
  );
}
