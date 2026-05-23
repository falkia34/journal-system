'use client';

import Link from 'next/link';
import { AddRounded } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useInternalStore } from '@app/presentation/hooks';
import { useEffect, useState } from 'react';
import { getRevisionsAction } from '@app/presentation/actions';
import { RevisionDto } from '@app/infrastructure/dtos';

type Props = {
  submissionId: string;
};

export function RevisionsToolbar({ submissionId }: Props) {
  const canCreate = useInternalStore((state) => state.session?.roles?.includes('AUTHOR')) ?? false;
  const [latestRevision, setLatestRevision] = useState<RevisionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRevision = async () => {
      const result = await getRevisionsAction(undefined, { submissionId }, undefined, 1);
      if (!('errors' in result) && result.revisions.length > 0) {
        setLatestRevision(result.revisions[0]);
      }
      setIsLoading(false);
    };

    if (canCreate) {
      fetchLatestRevision();
    }
  }, [canCreate, submissionId]);

  const canSubmit = canCreate && !isLoading && (!latestRevision || latestRevision.is_frozen);

  if (!canSubmit) {
    return null;
  }

  return (
    <Box className="ml-auto">
      <Button
        variant="filled"
        className="ml-4"
        aria-label="Add revision"
        LinkComponent={Link}
        href={`/submissions/${submissionId}/revisions/new`}
        startIcon={<AddRounded />}
      >
        Add
      </Button>
    </Box>
  );
}
