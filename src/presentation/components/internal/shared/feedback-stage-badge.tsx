import { Chip } from '@mui/material';
import type { Feedback } from '@app/domain/entities';

type Props = {
  stage: Feedback['stage'];
};

const stageColorMap: Record<Feedback['stage'], 'warning' | 'secondary'> = {
  REVIEW: 'warning',
  EDIT: 'secondary',
  COPY_EDIT: 'secondary',
  LAYOUT_EDIT: 'secondary',
  FINAL_REVIEW: 'warning',
};

export function FeedbackStageBadge({ stage }: Props) {
  return <Chip label={stage} color={stageColorMap[stage]} variant="filled" size="small" />;
}
