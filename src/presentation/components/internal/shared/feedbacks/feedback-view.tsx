'use client';

import Link from 'next/link';
import { Box, Container, Grid, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { ViewTile, PdfViewer } from '@app/presentation/components/internal/shared';
import { FeedbackDto } from '@app/infrastructure/dtos';
import { FeedbackMapper } from '@app/infrastructure/dtos';
import { DateTime } from 'luxon';
import { DownloadRounded } from '@mui/icons-material';

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
              General
            </Typography>
          </Toolbar>
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <ViewTile title="Content" subtitle={feedback.content} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Stage"
                subtitle={feedback.stage
                  .toLowerCase()
                  .split('_')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
                position="middle"
              />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Recommendation"
                subtitle={feedback.recommendation
                  .toLowerCase()
                  .split('_')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
                position={feedback.file ? 'middle' : 'bottom'}
              />
            </Grid>
            {feedback.file ? (
              <Grid size={12}>
                <Container
                  maxWidth={false}
                  sx={{ bgcolor: 'surfaceContainerHigh.main' }}
                  className="rounded-md p-4"
                >
                  <Typography variant="body1" component="p" className="font-medium">
                    Supporting Document
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
                        Supporting Document
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {typeof feedback.file === 'string' ? (
                          <>
                            <IconButton
                              component="a"
                              LinkComponent={Link}
                              href={`/blobs/feedbacks/${feedback.file}`}
                              download="feedback_document.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Download supporting document"
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
                    file={`/blobs/feedbacks/${feedback.file}`}
                    title="Supporting Document"
                    height={500}
                    className="mt-2"
                  />
                </Container>
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
              <ViewTile title="ID" subtitle={feedback.id} position="top" />
            </Grid>
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
