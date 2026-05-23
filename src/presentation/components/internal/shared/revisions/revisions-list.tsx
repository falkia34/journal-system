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
import { EditRounded, VisibilityRounded } from '@mui/icons-material';
import { EmptyRowOverlay, RevisionStageBadge } from '@app/presentation/components/internal/shared';
import { Revision, PaginationOptions } from '@app/domain/entities';
import {
  RevisionDto,
  RevisionMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { getRevisionsAction } from '@app/presentation/actions/revision.actions';
import { useInternalStore } from '@app/presentation/hooks';

type Props = {
  submissionId: string;
  initialRevisions: RevisionDto[];
  initialPaginationOptions: PaginationOptionsDto;
};

export function RevisionsList({ submissionId, initialRevisions, initialPaginationOptions }: Props) {
  const router = useRouter();
  const session = useInternalStore((s) => s.session);
  const isAuthor = session?.activeRole === 'AUTHOR';

  const initRevisions = useMemo(
    () => initialRevisions.map(RevisionMapper.fromDtoToDomain),
    [initialRevisions],
  );
  const initPaginationOptions = useMemo(
    () => PaginationOptionsMapper.fromDtoToDomain(initialPaginationOptions),
    [initialPaginationOptions],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<Revision[]>(initRevisions);
  const [rowCount, setRowCount] = useState<number>(
    initPaginationOptions.nextCursor ? -1 : initRevisions.length,
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
      const result = await getRevisionsAction(
        undefined,
        { submissionId },
        cursor,
        normalizedPaginationModel.pageSize,
      );

      if ('error' in result && result.error) {
        console.error(result.error);
        return;
      }

      const { revisions: newDtos, paginationOptions: nextPaginationDto } = result as {
        revisions: RevisionDto[];
        paginationOptions: PaginationOptionsDto;
      };
      const newRows = newDtos.map(RevisionMapper.fromDtoToDomain);
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
    router.push(`/submissions/${submissionId}/revisions/${params.row.id}`);
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
              field: 'version',
              headerName: 'Version',
              flex: 0.5,
              minWidth: 100,
            },
            {
              field: 'currentStage',
              headerName: 'Current Stage',
              flex: 1.5,
              minWidth: 200,
              renderCell: (params) => <RevisionStageBadge stage={params.row.currentStage} />,
            },
            {
              field: 'isFrozen',
              headerName: 'Frozen',
              flex: 0.5,
              minWidth: 100,
              valueFormatter: (value: boolean) => (value ? 'Yes' : 'No'),
            },
            {
              field: 'actions',
              type: 'actions',
              headerName: '',
              flex: 0.5,
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
                    href={`/submissions/${submissionId}/revisions/${params.row.actions.id}`}
                  />
                  {isAuthor && params.row.actions.currentStage === 'DRAFT' && (
                    <GridActionsCellItem
                      key="edit"
                      showInMenu
                      icon={<EditRounded />}
                      label="Edit"
                      component={Link}
                      // @ts-expect-error Link component requires href prop but it does not exposed as a prop for some reason. Read more on https://github.com/mui/mui-x/issues/9913
                      href={`/submissions/${submissionId}/revisions/${params.row.actions.id}/edit`}
                    />
                  )}
                </GridActionsCell>
              ),
            },
          ]}
          rows={rows.map((revision) => ({
            id: revision.id,
            version: revision.version,
            currentStage: revision.currentStage,
            isFrozen: revision.isFrozen,
            createdAt: revision.createdAt,
            actions: revision,
          }))}
          slots={{
            noRowsOverlay: EmptyRowOverlay as GridSlots['noRowsOverlay'],
          }}
          slotProps={{
            noRowsOverlay: { text: 'No revisions found.' },
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
