'use client';

import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import { ViewTile, ClickableViewTile } from '@app/presentation/components/internal/shared';
import type { PublicationDto } from '@app/infrastructure/dtos';
import { PublicationMapper } from '@app/infrastructure/dtos';
import { DateTime } from 'luxon';
import { ChevronRightRounded } from '@mui/icons-material';

type Props = {
  initialPublication: PublicationDto;
};

export function PublicationView({ initialPublication }: Props) {
  const publication = PublicationMapper.fromDtoToDomain(initialPublication);

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
              <ViewTile
                title="Published"
                subtitle={
                  publication.publishedAt
                    ? DateTime.fromJSDate(publication.publishedAt).toFormat('d LLLL yyyy')
                    : '-'
                }
                position="single"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" className="mb-4 w-full px-6">
        <Container maxWidth={false} className="max-w-2xl p-0">
          <Toolbar component="header" className="h-auto min-h-10 p-3">
            <Typography component="h2" variant="h6" className="font-medium">
              Submission
            </Typography>
          </Toolbar>
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <ViewTile
                title="Submission"
                subtitle={publication.submission?.title ?? '-'}
                position="single"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {publication.revision && (
        <Box component="section" className="mb-4 w-full px-6">
          <Container maxWidth={false} className="max-w-2xl p-0">
            <Grid container spacing={0.5}>
              <Grid size={12}>
                <ClickableViewTile
                  title="Accepted Revision"
                  subtitle={`Version ${publication.revision.version}`}
                  trailingIcon={<ChevronRightRounded />}
                  href={`/submissions/${publication.submissionId}/revisions/${publication.revisionId}`}
                  position="single"
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

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
                subtitle={DateTime.fromJSDate(publication.createdAt).toFormat(
                  'cccc, d LLLL yyyy, HH:mm:ss ZZZZ',
                )}
                position="top"
              />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Updated At"
                subtitle={DateTime.fromJSDate(publication.updatedAt).toFormat(
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
