'use client';

import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import { ViewTile } from '@app/presentation/components/internal/shared';
import { UserDto } from '@app/infrastructure/dtos';
import { UserMapper } from '@app/infrastructure/dtos';
import { DateTime } from 'luxon';

type Props = {
  initialUser: UserDto;
};

export function ProfileView({ initialUser }: Props) {
  const user = UserMapper.fromDtoToDomain(initialUser);

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
              <ViewTile title="Name" subtitle={user.name} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile title="Email" subtitle={user.email} position="bottom" />
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
              <ViewTile title="ID" subtitle={user.id} position="top" />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Created At"
                subtitle={DateTime.fromJSDate(user.createdAt).toFormat(
                  'cccc, d LLLL yyyy, HH:mm:ss ZZZZ',
                )}
                position="middle"
              />
            </Grid>
            <Grid size={12}>
              <ViewTile
                title="Updated At"
                subtitle={DateTime.fromJSDate(user.updatedAt).toFormat(
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
