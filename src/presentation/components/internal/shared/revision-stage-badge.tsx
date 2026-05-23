import { Chip } from '@mui/material';
import type { Revision } from '@app/domain/entities';

type Props = {
  stage: Revision['currentStage'];
};

const stageColorMap: Record<
  Revision['currentStage'],
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

export function RevisionStageBadge({ stage }: Props) {
  return (
    <Chip
      label={stage
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')}
      color={stageColorMap[stage]}
      variant="filled"
      size="small"
    />
  );
}
