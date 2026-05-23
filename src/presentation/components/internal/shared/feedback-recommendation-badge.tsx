import { Chip } from '@mui/material';
import type { Feedback } from '@app/domain/entities';

type Props = {
  recommendation: Feedback['recommendation'];
};

const recommendationColorMap: Record<Feedback['recommendation'], 'success' | 'error' | 'warning'> =
  {
    CONTINUE: 'success',
    REJECT: 'error',
    REVISE: 'warning',
  };

export function FeedbackRecommendationBadge({ recommendation }: Props) {
  return (
    <Chip
      label={recommendation
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')}
      color={recommendationColorMap[recommendation]}
      variant="filled"
      size="small"
    />
  );
}
