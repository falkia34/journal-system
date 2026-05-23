import { Chip } from '@mui/material';
import type { Participant } from '@app/domain/entities';

type Props = {
  stage: Participant['stage'];
};

const stageColorMap: Record<
  Participant['stage'],
  'warning' | 'secondary' | 'default' | 'info' | 'success' | 'error'
> = {
  REVIEW: 'warning',
  EDIT: 'secondary',
  COPY_EDIT: 'secondary',
  LAYOUT_EDIT: 'secondary',
  FINAL_REVIEW: 'warning',
};

export function ParticipantStageBadge({ stage }: Props) {
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
