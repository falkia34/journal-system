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
import {
  CheckCircleRounded,
  DeleteRounded,
  EditRounded,
  UnpublishedRounded,
  VisibilityRounded,
} from '@mui/icons-material';
import { AlertDialog, EmptyRowOverlay } from '@app/presentation/components/internal/shared';
import { Issue, PaginationOptions } from '@app/domain/entities';
import {
  IssueDto,
  IssueMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import {
  deleteIssueAction,
  getIssuesAction,
  publishIssueAction,
  unpublishIssueAction,
} from '@app/presentation/actions/issue.actions';

type Props = {
  initialIssues: IssueDto[];
  initialPaginationOptions: PaginationOptionsDto;
};

export function IssuesList({ initialIssues, initialPaginationOptions }: Props) {
  const router = useRouter();
  const initIssues = useMemo(() => initialIssues.map(IssueMapper.fromDtoToDomain), [initialIssues]);
  const initPaginationOptions = useMemo(
    () => PaginationOptionsMapper.fromDtoToDomain(initialPaginationOptions),
    [initialPaginationOptions],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<Issue[]>(initIssues);
  const [rowCount, setRowCount] = useState<number>(
    initPaginationOptions.nextCursor ? -1 : initIssues.length,
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
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedIssueName, setSelectedIssueName] = useState<string | null>(null);

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
      const result = await getIssuesAction(
        ['journal'],
        undefined,
        cursor,
        normalizedPaginationModel.pageSize,
      );

      if ('errors' in result) {
        console.error(result.errors?.message?.[0] ?? 'Failed to load issues.');
        return;
      }

      const newRows = result.issues.map(IssueMapper.fromDtoToDomain);
      const nextPaginationOptions = PaginationOptionsMapper.fromDtoToDomain(
        result.paginationOptions,
      );
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
    router.push(`/issues/${params.row.id}`);
  };

  const handlePublish = async (issue: Issue) => {
    setIsLoading(true);
    try {
      const result = await publishIssueAction(issue.id);
      if ('errors' in result) {
        console.error(result.errors?.message?.[0] ?? 'Failed to publish issue.');
        return;
      }
      const updated = IssueMapper.fromDtoToDomain(result.issue);
      setRows((prev) => prev.map((row) => (row.id === issue.id ? updated : row)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async (issue: Issue) => {
    setIsLoading(true);
    try {
      const result = await unpublishIssueAction(issue.id);
      if ('errors' in result) {
        console.error(result.errors?.message?.[0] ?? 'Failed to unpublish issue.');
        return;
      }
      const updated = IssueMapper.fromDtoToDomain(result.issue);
      setRows((prev) => prev.map((row) => (row.id === issue.id ? updated : row)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (issueId: string, issueTitle?: string | null) => {
    setSelectedIssueId(issueId);
    setSelectedIssueName(issueTitle || null);
    setOpenDeleteDialog(true);
  };

  const handleDeleteAccept = async () => {
    if (!selectedIssueId) {
      console.error('No issue selected for deletion');
      return;
    }

    const result = await deleteIssueAction(selectedIssueId);
    if (result?.errors) {
      console.error(result.errors?.message?.[0] ?? 'Failed to delete issue.');
    } else {
      setRows((prevRows) => prevRows.filter((row) => row.id !== selectedIssueId));
    }

    setOpenDeleteDialog(false);
    setTimeout(() => {
      setSelectedIssueId(null);
      setSelectedIssueName(null);
    }, 1000);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setTimeout(() => {
      setSelectedIssueId(null);
      setSelectedIssueName(null);
    }, 1000);
  };

  return (
    <>
      <AlertDialog
        open={openDeleteDialog}
        onAccept={handleDeleteAccept}
        onCancel={handleDeleteCancel}
        title="Permanently delete?"
        description={`Are you sure you want to permanently delete ${selectedIssueName || 'this issue'}? This action cannot be undone.`}
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
                field: 'volume',
                headerName: 'Vol',
                type: 'number',
                flex: 0.5,
                minWidth: 80,
              },
              {
                field: 'number',
                headerName: 'No',
                type: 'number',
                flex: 0.5,
                minWidth: 80,
              },
              {
                field: 'title',
                headerName: 'Title',
                flex: 2,
                minWidth: 300,
              },
              {
                field: 'journal',
                headerName: 'Journal',
                flex: 2,
                minWidth: 300,
              },
              {
                field: 'published',
                headerName: 'Published',
                type: 'boolean',
                flex: 0.5,
                minWidth: 80,
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
                      href={`/issues/${params.row.actions.id}`}
                    />
                    <GridActionsCellItem
                      key="edit"
                      showInMenu
                      icon={<EditRounded />}
                      label="Edit"
                      component={Link}
                      // @ts-expect-error Link component requires href prop but it does not exposed as a prop for some reason. Read more on https://github.com/mui/mui-x/issues/9913
                      href={`/issues/${params.row.actions.id}/edit`}
                    />
                    {params.row.actions.publishedAt ? (
                      <GridActionsCellItem
                        key="unpublish"
                        showInMenu
                        icon={<UnpublishedRounded />}
                        label="Unpublish"
                        onClick={() => handleUnpublish(params.row.actions)}
                      />
                    ) : (
                      <GridActionsCellItem
                        key="publish"
                        showInMenu
                        icon={<CheckCircleRounded />}
                        label="Publish"
                        onClick={() => handlePublish(params.row.actions)}
                      />
                    )}
                    <GridActionsCellItem
                      key="delete"
                      showInMenu
                      icon={<DeleteRounded />}
                      label="Delete"
                      onClick={() =>
                        handleDeleteClick(
                          params.row.actions.id,
                          params.row.actions.title ?? params.row.title ?? 'this issue',
                        )
                      }
                    />
                  </GridActionsCell>
                ),
              },
            ]}
            rows={rows.map((issue) => ({
              id: issue.id,
              volume: issue.volume,
              number: issue.number,
              title: issue.title ?? '-',
              journal: issue.journal?.name ?? '-',
              published: issue.publishedAt ? true : false,
              actions: issue,
            }))}
            slots={{
              noRowsOverlay: EmptyRowOverlay as GridSlots['noRowsOverlay'],
            }}
            slotProps={{
              noRowsOverlay: { text: 'No issues found.' },
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
