'use client';

import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import { ClickableViewTile } from '@app/presentation/components/internal/shared';
import { DecisionMapper, type DecisionDto } from '@app/infrastructure/dtos';

type Props = {
  initialDecisions: DecisionDto[];
};

export function DecisionsList({ initialDecisions }: Props) {
  const decisions = initialDecisions.map(DecisionMapper.fromDtoToDomain);

  return (
    <Box component="section" className="mb-4 w-full px-6">
      <Container maxWidth={false} className="max-w-2xl p-0">
        <Toolbar component="header" className="h-auto min-h-10 p-3">
          <Typography component="h2" variant="h6" className="font-medium">
            Decisions
          </Typography>
        </Toolbar>
        <Grid container spacing={0.5}>
          {decisions.map((decision, i) => (
            <Grid size={12} key={decision.id}>
              <ClickableViewTile
                title={`Decision: ${decision.startStage
                  .toLowerCase()
                  .split('_')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')} → ${decision.decidedStage
                  .toLowerCase()
                  .split('_')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}`}
                subtitle={
                  decision.comment
                    ? decision.comment.length > 80
                      ? `${decision.comment.slice(0, 80)}...`
                      : decision.comment
                    : 'No comment'
                }
                position={
                  i === 0 && decisions.length === 1
                    ? 'single'
                    : i === 0
                      ? 'top'
                      : i === decisions.length - 1
                        ? 'bottom'
                        : 'middle'
                }
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
