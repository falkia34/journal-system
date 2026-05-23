'use client';

import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import { ViewTile } from '@app/presentation/components/internal/shared';
import type { JournalDto } from '@app/infrastructure/dtos';
import { JournalMapper } from '@app/infrastructure/dtos';
import { DateTime } from 'luxon';

type Props = {
  initialJournal: JournalDto;
};

export function JournalView({ initialJournal }: Props) {
  const journal = JournalMapper.fromDtoToDomain(initialJournal);

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
              <ViewTile title="Name" subtitle={journal.name} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile title="Description" subtitle={journal.description} position="middle" />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Editor-in-Chief"
                subtitle={journal.editorInChief?.name ?? 'Not assigned'}
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
              <ViewTile title="ID" subtitle={journal.id} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Created At"
                subtitle={DateTime.fromJSDate(journal.createdAt).toFormat(
                  'cccc, d LLLL yyyy, HH:mm:ss ZZZZ',
                )}
                position="middle"
              />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Updated At"
                subtitle={DateTime.fromJSDate(journal.updatedAt).toFormat(
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
