import { SectionHeader, ClickableViewTile } from '@app/presentation/components/internal/shared';
import { ChevronRightRounded, PersonRounded } from '@mui/icons-material';
import { Box, Container, Grid } from '@mui/material';

export default async function SettingsPage() {
  return (
    <>
      <SectionHeader title="Settings" />
      <Box component="section" className="mb-6 w-full px-6">
        <Container maxWidth={false} className="max-w-2xl p-0">
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <ClickableViewTile
                title="Profile"
                subtitle="View and edit your profile information"
                icon={<PersonRounded />}
                trailingIcon={<ChevronRightRounded />}
                href="/settings/profile"
                position="single"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
