'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, NoSsr } from '@mui/material';
import {
  DataGrid,
  GridActionsCell,
  GridActionsCellItem,
  GridPaginationMeta,
  GridPaginationModel,
  GridRowParams,
  GridSlots,
} from '@mui/x-data-grid';
import { VisibilityRounded } from '@mui/icons-material';
import {
  EmptyRowOverlay,
  SubmissionStatusBadge,
} from '@app/presentation/components/internal/shared';
import { Submission, PaginationOptions } from '@app/domain/entities';
import {
  SubmissionDto,
  SubmissionMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { getSubmissionsAction } from '@app/presentation/actions/submission.actions';

type Props = {
  initialSubmissions: SubmissionDto[];
  initialPaginationOptions: PaginationOptionsDto;
};

export function SubmissionsList({ initialSubmissions, initialPaginationOptions }: Props) {
  const router = useRouter();
  const initSubmissions = useMemo(
    () => initialSubmissions.map(SubmissionMapper.fromDtoToDomain),
    [initialSubmissions],
  );
  const initPaginationOptions = useMemo(
    () => PaginationOptionsMapper.fromDtoToDomain(initialPaginationOptions),
    [initialPaginationOptions],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<Submission[]>(initSubmissions);
  const [rowCount, setRowCount] = useState<number>(
    initPaginationOptions.nextCursor ? -1 : initSubmissions.length,
  );
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: initPaginationOptions.previousCursor ? 1 : 0,
    pageSize: initPaginationOptions.take || 25,
  });
  const [paginationMeta, setPaginationMeta] = useState<GridPaginationMeta>({
    hasNextPage: Boolean(initPaginationOptions.nextCursor),
  });
  const [paginationOptions, setPaginationOptions] =
    useState<Pick<PaginationOptions, 'cursor' | 'nextCursor' | 'previousCursor'>>(
      initPaginationOptions,
    );

  const handlePaginationModelChange = async (newPaginationModel: GridPaginationModel) => {
    const isPageSizeChanged = newPaginationModel.pageSize !== paginationModel.pageSize;
    const normalizedPaginationModel = isPageSizeChanged
      ? { ...newPaginationModel, page: 0 }
      : newPaginationModel;

    setIsLoading(true);

    let cursor: string | undefined;
    if (isPageSizeChanged) {
      cursor = undefined;
    } else if (
      normalizedPaginationModel.page > paginationModel.page &&
      paginationOptions.nextCursor
    ) {
      cursor = paginationOptions.nextCursor;
    } else if (
      normalizedPaginationModel.page < paginationModel.page &&
      paginationOptions.previousCursor
    ) {
      cursor = paginationOptions.previousCursor;
    } else {
      cursor = paginationOptions.cursor;
    }

    try {
      const result = await getSubmissionsAction(
        ['author', 'journal'],
        undefined,
        cursor,
        normalizedPaginationModel.pageSize,
      );

      if ('error' in result && result.error) {
        console.error(result.error);
        return;
      }

      const { submissions: newDtos, paginationOptions: nextPaginationDto } = result as {
        submissions: SubmissionDto[];
        paginationOptions: PaginationOptionsDto;
      };
      const newRows = newDtos.map(SubmissionMapper.fromDtoToDomain);
      const nextPaginationOptions = PaginationOptionsMapper.fromDtoToDomain(nextPaginationDto);
      const hasNextPage = Boolean(nextPaginationOptions.nextCursor);

      let page: number;
      if (normalizedPaginationModel.page === 0 && nextPaginationOptions.previousCursor) {
        page = 1;
      } else if (
        normalizedPaginationModel.page < paginationModel.page &&
        !nextPaginationOptions.previousCursor
      ) {
        page = 0;
      } else {
        page = normalizedPaginationModel.page;
      }

      setRows(newRows);
      setRowCount(hasNextPage ? -1 : page * normalizedPaginationModel.pageSize + newRows.length);
      setPaginationMeta({ hasNextPage });
      setPaginationModel({ page, pageSize: normalizedPaginationModel.pageSize });
      setPaginationOptions(nextPaginationOptions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (params: GridRowParams) => {
    router.push(`/submissions/${params.row.id}`);
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
              minWidth: 240,
            },
            {
              field: 'title',
              headerName: 'Title',
              flex: 2,
              minWidth: 260,
            },
            {
              field: 'submitter',
              headerName: 'Submitter',
              flex: 1,
              minWidth: 180,
            },
            {
              field: 'journal',
              headerName: 'Journal',
              flex: 1,
              minWidth: 200,
            },
            {
              field: 'status',
              headerName: 'Status',
              flex: 0.8,
              minWidth: 160,
              renderCell: (params) => <SubmissionStatusBadge status={params.row.status} />,
            },
            {
              field: 'actions',
              type: 'actions',
              headerName: '',
              flex: 0.4,
              minWidth: 60,
              maxWidth: 60,
              renderCell: (params) => (
                <GridActionsCell {...params}>
                  <GridActionsCellItem
                    key="view"
                    showInMenu
                    icon={<VisibilityRounded />}
                    label="View"
                    component={Link}
                    // @ts-expect-error Link component requires href prop but it does not exposed as a prop for some reason. Read more on https://github.com/mui/mui-x/issues/9913
                    href={`/submissions/${params.row.actions.id}`}
                  />
                </GridActionsCell>
              ),
            },
          ]}
          rows={rows.map((submission) => ({
            id: submission.id,
            title: submission.title,
            submitter: submission.author?.name ?? '-',
            journal: submission.journal?.name ?? '-',
            status: submission.status,
            actions: submission,
          }))}
          slots={{
            noRowsOverlay: EmptyRowOverlay as GridSlots['noRowsOverlay'],
          }}
          slotProps={{
            noRowsOverlay: { text: 'No submissions found.' },
          }}
          pageSizeOptions={[25, 50, 100]}
          paginationMode="server"
          initialState={{
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          loading={isLoading}
          rowCount={rowCount}
          paginationMeta={paginationMeta}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
        />
      </NoSsr>
    </Box>
  );
}
