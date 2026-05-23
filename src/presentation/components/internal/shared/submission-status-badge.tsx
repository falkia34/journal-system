import { Chip } from '@mui/material';
import type { Submission } from '@app/domain/entities';

type Props = {
  status: Submission['status'];
};

const statusColorMap: Record<
  Submission['status'],
  'default' | 'info' | 'warning' | 'secondary' | 'success' | 'error'
> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  REVIEW: 'warning',
  EDIT: 'secondary',
  COPY_EDIT: 'secondary',
  LAYOUT_EDIT: 'secondary',
  FINAL_REVIEW: 'warning',
  PUBLISHED: 'success',
  REJECTED: 'error',
  WITHDRAWN: 'default',
};

export function SubmissionStatusBadge({ status }: Props) {
  return (
    <Chip
      label={status
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')}
      color={statusColorMap[status]}
      variant="filled"
      size="small"
    />
  );
}
