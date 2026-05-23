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
import { User, PaginationOptions } from '@app/domain/entities';
import {
  UserDto,
  UserMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { deleteUserAction, getUsersAction } from '@app/presentation/actions/user.actions';

type Props = {
  initialUsers: UserDto[];
  initialPaginationOptions: PaginationOptionsDto;
};

export function UsersList({ initialUsers, initialPaginationOptions }: Props) {
  const router = useRouter();
  const initUsers = useMemo(() => initialUsers.map(UserMapper.fromDtoToDomain), [initialUsers]);
  const initPaginationOptions = useMemo(
    () => PaginationOptionsMapper.fromDtoToDomain(initialPaginationOptions),
    [initialPaginationOptions],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<User[]>(initUsers);
  const [rowCount, setRowCount] = useState<number>(
    initPaginationOptions.nextCursor ? -1 : initUsers.length,
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

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
      const result = await getUsersAction(undefined, cursor, normalizedPaginationModel.pageSize);

      if ('errors' in result) {
        console.error(result.errors?.message?.[0] ?? 'Failed to load users.');
        return;
      }

      const newRows = result.users.map(UserMapper.fromDtoToDomain);
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
    router.push(`/users/${params.row.id}`);
  };

  const handleDeleteClick = (userId: string, userName?: string | null) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName || null);
    setOpenDeleteDialog(true);
  };

  const handleDeleteAccept = async () => {
    if (!selectedUserId) {
      console.error('No user selected for deletion');
      return;
    }

    const result = await deleteUserAction(selectedUserId);
    if (result?.errors) {
      console.error(result.errors?.message?.[0] ?? 'Failed to delete user.');
    } else {
      setRows((prevRows) => prevRows.filter((row) => row.id !== selectedUserId));
    }

    setOpenDeleteDialog(false);
    setTimeout(() => {
      setSelectedUserId(null);
      setSelectedUserName(null);
    }, 1000);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setTimeout(() => {
      setSelectedUserId(null);
      setSelectedUserName(null);
    }, 1000);
  };

  return (
    <>
      <AlertDialog
        open={openDeleteDialog}
        onAccept={handleDeleteAccept}
        onCancel={handleDeleteCancel}
        title="Permanently delete?"
        description={`Are you sure you want to permanently delete ${selectedUserName || 'this user'}? This action cannot be undone.`}
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
                field: 'email',
                headerName: 'Email',
                flex: 2,
                minWidth: 240,
              },
              {
                field: 'roles',
                headerName: 'Roles',
                flex: 1.5,
                minWidth: 180,
                valueFormatter: (value: string[]) => value.join(', '),
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
                      href={`/users/${params.row.actions.id}`}
                    />
                    <GridActionsCellItem
                      key="edit"
                      showInMenu
                      icon={<EditRounded />}
                      label="Edit"
                      component={Link}
                      // @ts-expect-error Link component requires href prop but it does not exposed as a prop for some reason. Read more on https://github.com/mui/mui-x/issues/9913
                      href={`/users/${params.row.actions.id}/edit`}
                    />
                    <GridActionsCellItem
                      key="delete"
                      showInMenu
                      icon={<DeleteRounded />}
                      label="Delete"
                      onClick={() =>
                        handleDeleteClick(
                          params.row.actions.id,
                          params.row.actions.name ?? params.row.name ?? 'this user',
                        )
                      }
                    />
                  </GridActionsCell>
                ),
              },
            ]}
            rows={rows.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              roles: user.roles,
              actions: user,
            }))}
            slots={{
              noRowsOverlay: EmptyRowOverlay as GridSlots['noRowsOverlay'],
            }}
            slotProps={{
              noRowsOverlay: { text: 'No users found.' },
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
