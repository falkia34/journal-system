'use client';

import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import { ViewTile, ClickableViewTile } from '@app/presentation/components/internal/shared';
import { ChevronRightRounded } from '@mui/icons-material';
import { SubmissionDto } from '@app/infrastructure/dtos';
import { SubmissionMapper } from '@app/infrastructure/dtos';
import { DateTime } from 'luxon';

type Props = {
  initialSubmission: SubmissionDto;
};

export function SubmissionView({ initialSubmission }: Props) {
  const submission = SubmissionMapper.fromDtoToDomain(initialSubmission);

  return (
    <>
      <Box component="section" className="mb-4 w-full px-6">
        <Container maxWidth={false} className="max-w-2xl p-0">
          <Toolbar component="header" className="h-auto min-h-10 p-3">
            <Typography component="h2" variant="h6" className="font-medium">
              General
            </Typography>
          </Toolbar>
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <ViewTile title="Title" subtitle={submission.title} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile title="Abstract" subtitle={submission.abstract} position="middle" />
            </Grid>
            {submission.author ? (
              <Grid size={12}>
                <ViewTile title="Submitter" subtitle={submission.author.name} position="middle" />
              </Grid>
            ) : null}
            <Grid size={12}>
              <ViewTile
                title="Authors"
                subtitle={submission.authors.join(', ')}
                position="middle"
              />
            </Grid>
            {submission.journal ? (
              <Grid size={12}>
                <ViewTile title="Journal" subtitle={submission.journal.name} position="middle" />
              </Grid>
            ) : null}
            <Grid size={12}>
              <ClickableViewTile
                title="Revisions"
                subtitle="View all revisions"
                trailingIcon={<ChevronRightRounded />}
                href={`/submissions/${submission.id}/revisions`}
                position="bottom"
              />
            </Grid>
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
              <ViewTile title="ID" subtitle={submission.id} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Created At"
                subtitle={DateTime.fromJSDate(submission.createdAt).toFormat(
                  'cccc, d LLLL yyyy, HH:mm:ss ZZZZ',
                )}
                position="middle"
              />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Updated At"
                subtitle={DateTime.fromJSDate(submission.updatedAt).toFormat(
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
