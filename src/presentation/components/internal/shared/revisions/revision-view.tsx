'use client';

import { Box, Container, Grid, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import {
  ViewTile,
  PdfViewer,
  ClickableViewTile,
} from '@app/presentation/components/internal/shared';
import type { RevisionDto } from '@app/infrastructure/dtos';
import { RevisionMapper } from '@app/infrastructure/dtos';
import { DateTime } from 'luxon';
import { DownloadRounded, ChevronRightRounded } from '@mui/icons-material';
import Link from 'next/link';

type Props = {
  initialRevision: RevisionDto;
  role: string;
  submissionId: string;
};

export function RevisionView({ initialRevision, role, submissionId }: Props) {
  const revision = RevisionMapper.fromDtoToDomain(initialRevision);

  return (
    <>
      <Box component="section" className="mb-4 w-full px-6">
        <Container maxWidth={false} className="max-w-2xl p-0">
          <Toolbar component="header" className="h-auto min-h-10 p-3">
            <Typography component="h2" variant="h6" className="font-medium">
              Revision
            </Typography>
          </Toolbar>
          <Grid container spacing={0.5} className="tiles-rounded-dynamic">
            <Grid size={12}>
              <ViewTile
                title="Version"
                subtitle={String(revision.version)}
                position={revision.file ? 'top' : 'single'}
              />
            </Grid>
            {revision.file ? (
              <Grid size={12}>
                <Container
                  maxWidth={false}
                  sx={{ bgcolor: 'surfaceContainerHigh.main' }}
                  className="rounded-md p-4"
                >
                  <Typography variant="body1" component="p" className="font-medium">
                    Revision File
                  </Typography>
                  <Box
                    sx={{ borderColor: 'outline' }}
                    className="mt-2 w-full rounded-lg border border-solid p-4"
                  >
                    <Box className="flex flex-row items-center justify-between gap-2">
                      <Typography
                        variant="body2"
                        color="onSurfaceVariant.main"
                        className="font-semibold"
                      >
                        Revision File
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {typeof revision.file === 'string' ? (
                          <>
                            <IconButton
                              component="a"
                              LinkComponent={Link}
                              href={`/blobs/revisions/${revision.file}`}
                              download="revision.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Download revision file"
                              title="Download"
                            >
                              <DownloadRounded fontSize="small" />
                            </IconButton>
                          </>
                        ) : null}
                      </Stack>
                    </Box>
                  </Box>
                  <PdfViewer
                    file={`/blobs/revisions/${revision.file}`}
                    title="Revision File"
                    height={500}
                    className="mt-2"
                  />
                </Container>
              </Grid>
            ) : null}
            {revision.decisions && revision.decisions.length > 0 ? (
              <Grid size={12}>
                <ClickableViewTile
                  title="Decisions"
                  subtitle="View decisions for this revision"
                  trailingIcon={<ChevronRightRounded />}
                  href={`/submissions/${submissionId}/revisions/${revision.id}/decisions`}
                  position="middle"
                />
              </Grid>
            ) : null}
            {role === 'ADMINISTRATOR' || role === 'AUTHOR' ? (
              <Grid size={12}>
                <ClickableViewTile
                  title="Feedbacks"
                  subtitle="View feedbacks for this revision"
                  trailingIcon={<ChevronRightRounded />}
                  href={`/submissions/${submissionId}/revisions/${revision.id}/feedbacks`}
                  position="middle"
                />
              </Grid>
            ) : null}
            {role === 'EDITOR' || role === 'REVIEWER' ? (
              <Grid size={12}>
                <ClickableViewTile
                  title="My Feedbacks"
                  subtitle={`View feedback(s) you created`}
                  trailingIcon={<ChevronRightRounded />}
                  href={`/submissions/${submissionId}/revisions/${revision.id}/feedbacks`}
                  position="bottom"
                />
              </Grid>
            ) : null}
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
              <ViewTile title="ID" subtitle={revision.id} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Created At"
                subtitle={DateTime.fromJSDate(revision.createdAt).toFormat(
                  'cccc, d LLLL yyyy, HH:mm:ss ZZZZ',
                )}
                position="middle"
              />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Updated At"
                subtitle={DateTime.fromJSDate(revision.updatedAt).toFormat(
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
