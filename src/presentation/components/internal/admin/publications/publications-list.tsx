'use client';

import Link from 'next/link';
import { Box, NoSsr } from '@mui/material';
import {
  DataGrid,
  GridActionsCell,
  GridActionsCellItem,
  GridRowParams,
  GridSlots,
} from '@mui/x-data-grid';
import { VisibilityRounded } from '@mui/icons-material';
import { EmptyRowOverlay } from '@app/presentation/components/internal/shared';
import { PublicationMapper, type PublicationDto } from '@app/infrastructure/dtos';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type Props = {
  initialPublications: PublicationDto[];
};

export function PublicationsList({ initialPublications }: Props) {
  const router = useRouter();

  const publications = useMemo(
    () => initialPublications.map(PublicationMapper.fromDtoToDomain),
    [initialPublications],
  );

  const handleRowClick = (params: GridRowParams) => {
    router.push(
      `/submissions/${params.row.actions.submissionId}/revisions/${params.row.actions.revisionId}`,
    );
  };

  return (
    <Box component="section" className="mb-6 w-full px-6">
      <NoSsr>
        <DataGrid
          sx={{
            '.MuiTablePagination-displayedRows': { display: 'none' },
            '.MuiDataGrid-row': { '&:hover': { cursor: 'pointer' } },
          }}
          columns={[
            {
              field: 'id',
              headerName: 'ID',
              flex: 1,
              minWidth: 300,
            },
            {
              field: 'submissionTitle',
              headerName: 'Title',
              flex: 2,
              minWidth: 300,
            },
            {
              field: 'revisionVersion',
              headerName: 'Version',
              flex: 0.5,
              minWidth: 80,
              type: 'number',
            },
            {
              field: 'publishedAt',
              headerName: 'Published',
              flex: 1,
              minWidth: 150,
            },
            {
              field: 'actions',
              type: 'actions',
              headerName: '',
              flex: 0.5,
              minWidth: 50,
              maxWidth: 50,
              renderCell: (params) => (
                <GridActionsCell {...params}>
                  <GridActionsCellItem
                    key="view"
                    showInMenu
                    icon={<VisibilityRounded />}
                    label="View"
                    component={Link}
                    // @ts-expect-error Link component requires href prop but it does not exposed as a prop for some reason. Read more on https://github.com/mui/mui-x/issues/9913
                    href={`/submissions/${params.row.actions.submissionId}/revisions/${params.row.actions.revisionId}`}
                  />
                </GridActionsCell>
              ),
            },
          ]}
          rows={publications.map((publication) => ({
            id: publication.id,
            submissionTitle: publication.submission?.title ?? '-',
            revisionVersion: publication.revision?.version ?? 1,
            publishedAt: publication.publishedAt
              ? new Date(publication.publishedAt).toLocaleDateString()
              : '-',
            actions: publication,
          }))}
          slots={{
            noRowsOverlay: EmptyRowOverlay as GridSlots['noRowsOverlay'],
          }}
          slotProps={{
            noRowsOverlay: { text: 'No publications found.' },
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          hideFooter
        />
      </NoSsr>
    </Box>
  );
}
