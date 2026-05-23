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
import { DeleteRounded, EditRounded, VisibilityRounded } from '@mui/icons-material';
import { AlertDialog, EmptyRowOverlay } from '@app/presentation/components/internal/shared';
import { Journal, PaginationOptions } from '@app/domain/entities';
import {
  JournalDto,
  JournalMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { deleteJournalAction, getJournalsAction } from '@app/presentation/actions/journal.actions';

type Props = {
  initialJournals: JournalDto[];
  initialPaginationOptions: PaginationOptionsDto;
};

export function JournalsList({ initialJournals, initialPaginationOptions }: Props) {
  const initJournals = useMemo(
    () => initialJournals.map(JournalMapper.fromDtoToDomain),
    [initialJournals],
  );
  const initPaginationOptions = useMemo(
    () => PaginationOptionsMapper.fromDtoToDomain(initialPaginationOptions),
    [initialPaginationOptions],
  );
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<Journal[]>(initJournals);
  const [rowCount, setRowCount] = useState<number>(
    initPaginationOptions.nextCursor ? -1 : initJournals.length,
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

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
  const [selectedJournalName, setSelectedJournalName] = useState<string | null>(null);

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
      const result = await getJournalsAction(
        ['editorInChief'],
        undefined,
        cursor,
        normalizedPaginationModel.pageSize,
      );

      if ('errors' in result) {
        console.error(result.errors?.message?.[0] ?? 'Failed to load journals.');
        return;
      }

      const { journals: newDtos, paginationOptions: nextPaginationDto } = result;
      const newRows = newDtos.map(JournalMapper.fromDtoToDomain);
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
    router.push(`/journals/${params.row.id}`);
  };

  const handleDeleteClick = (journalId: string, journalName?: string | null) => {
    setSelectedJournalId(journalId);
    setSelectedJournalName(journalName || null);
    setOpenDeleteDialog(true);
  };

  const handleDeleteAccept = async () => {
    if (!selectedJournalId) {
      console.error('No journal selected for deletion');
      return;
    }
    const result = await deleteJournalAction(selectedJournalId);
    if (result?.errors) {
      console.error(result.errors?.message?.[0] ?? 'Failed to delete journal.');
    } else {
      setRows((prevRows) => prevRows.filter((row) => row.id !== selectedJournalId));
    }
    setOpenDeleteDialog(false);
    setTimeout(() => {
      setSelectedJournalId(null);
      setSelectedJournalName(null);
    }, 1000);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setTimeout(() => {
      setSelectedJournalId(null);
      setSelectedJournalName(null);
    }, 1000);
  };

  return (
    <>
      <AlertDialog
        open={openDeleteDialog}
        onAccept={handleDeleteAccept}
        onCancel={handleDeleteCancel}
        title="Permanently delete?"
        description={`Are you sure you want to permanently delete ${selectedJournalName || 'this journal'}? This action cannot be undone.`}
        acceptText="Delete"
        cancelText="Cancel"
      />
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
                field: 'name',
                headerName: 'Name',
                flex: 2,
                minWidth: 200,
              },
              {
                field: 'editorInChiefName',
                headerName: 'Editor-in-Chief',
                flex: 1.5,
                minWidth: 180,
                valueGetter: (_value: unknown, row: { actions: Journal }) =>
                  row.actions.editorInChief?.name ?? '-',
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
                      href={`/journals/${params.row.actions.id}`}
                    />
                    <GridActionsCellItem
                      key="edit"
                      showInMenu
                      icon={<EditRounded />}
                      label="Edit"
                      component={Link}
                      // @ts-expect-error Link component requires href prop but it does not exposed as a prop for some reason. Read more on https://github.com/mui/mui-x/issues/9913
                      href={`/journals/${params.row.actions.id}/edit`}
                    />
                    <GridActionsCellItem
                      key="delete"
                      showInMenu
                      icon={<DeleteRounded />}
                      label="Delete"
                      onClick={() =>
                        handleDeleteClick(
                          params.row.actions.id,
                          params.row.actions.name ?? 'this journal',
                        )
                      }
                    />
                  </GridActionsCell>
                ),
              },
            ]}
            rows={rows.map((journal) => ({
              id: journal.id,
              name: journal.name,
              editorInChiefName: journal.editorInChief?.name ?? '-',
              createdAt: journal.createdAt,
              actions: journal,
            }))}
            slots={{
              noRowsOverlay: EmptyRowOverlay as GridSlots['noRowsOverlay'],
            }}
            slotProps={{
              noRowsOverlay: { text: 'No journals found.' },
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
    </>
  );
}
