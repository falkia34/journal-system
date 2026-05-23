'use client';

import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import {
  ViewTile,
  FeedbackStageBadge,
  FeedbackRecommendationBadge,
} from '@app/presentation/components/internal/shared';
import type { FeedbackDto } from '@app/infrastructure/dtos';
import { FeedbackMapper } from '@app/infrastructure/dtos';
import { DateTime } from 'luxon';

type Props = {
  initialFeedback: FeedbackDto;
};

export function FeedbackView({ initialFeedback }: Props) {
  const feedback = FeedbackMapper.fromDtoToDomain(initialFeedback);

  return (
    <>
      <Box component="section" className="mb-4 w-full px-6">
        <Container maxWidth={false} className="max-w-2xl p-0">
          <Toolbar component="header" className="h-auto min-h-10 p-3">
            <Typography component="h2" variant="h6" className="font-medium">
              Feedback
            </Typography>
          </Toolbar>
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <ViewTile title="Content" subtitle={feedback.content} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Recommendation"
                subtitle={feedback.recommendation}
                icon={<FeedbackRecommendationBadge recommendation={feedback.recommendation} />}
                position="middle"
              />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Stage"
                subtitle={feedback.stage}
                icon={<FeedbackStageBadge stage={feedback.stage} />}
                position={feedback.author ? 'middle' : 'bottom'}
              />
            </Grid>
            {feedback.author && (
              <Grid size={12}>
                <ViewTile title="Author" subtitle={feedback.author.name} position="bottom" />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      <Box component="section" className="mb-6 w-full px-6">
        <Container maxWidth={false} className="max-w-2xl p-0">
          <Toolbar component="header" className="h-auto min-h-10 p-3">
            <Typography component="h2" variant="h6" className="font-medium">
              Metadata
            </Typography>
          </Toolbar>
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <ViewTile
                title="Created At"
                subtitle={DateTime.fromJSDate(feedback.createdAt).toFormat(
                  'cccc, d LLLL yyyy, HH:mm:ss ZZZZ',
                )}
                position="top"
              />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Updated At"
                subtitle={DateTime.fromJSDate(feedback.updatedAt).toFormat(
                  'cccc, d LLLL yyyy, HH:mm:ss ZZZZ',
                )}
                position="bottom"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
