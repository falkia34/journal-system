'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, NoSsr } from '@mui/material';
import { DataGrid, GridActionsCell, GridActionsCellItem, GridSlots } from '@mui/x-data-grid';
import { DeleteRounded, EditRounded, VisibilityRounded } from '@mui/icons-material';
import {
  AlertDialog,
  EmptyRowOverlay,
  ParticipantStageBadge,
} from '@app/presentation/components/internal/shared';
import { ParticipantMapper, type ParticipantDto } from '@app/infrastructure/dtos';
import { deleteParticipantAction } from '@app/presentation/actions';

type Props = {
  initialParticipants: ParticipantDto[];
};

export function ParticipantsList({ initialParticipants }: Props) {
  const initParticipants = useMemo(
    () => initialParticipants.map(ParticipantMapper.fromDtoToDomain),
    [initialParticipants],
  );

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedParticipantName, setSelectedParticipantName] = useState<string | null>(null);

  const handleDeleteClick = (participantId: string, participantName?: string | null) => {
    setSelectedParticipantId(participantId);
    setSelectedParticipantName(participantName || null);
    setOpenDeleteDialog(true);
  };

  const handleDeleteAccept = async () => {
    if (!selectedParticipantId) {
      console.error('No participant selected for deletion');
      return;
    }

    const participant = initParticipants.find((p) => p.id === selectedParticipantId);
    const result = await deleteParticipantAction(selectedParticipantId, participant?.submissionId);
    if (result?.errors) {
      console.error(result.errors?.message?.[0] ?? 'Failed to delete participant.');
    }

    setOpenDeleteDialog(false);
    setTimeout(() => {
      setSelectedParticipantId(null);
      setSelectedParticipantName(null);
    }, 1000);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setTimeout(() => {
      setSelectedParticipantId(null);
      setSelectedParticipantName(null);
    }, 1000);
  };

  return (
    <>
      <AlertDialog
        open={openDeleteDialog}
        onAccept={handleDeleteAccept}
        onCancel={handleDeleteCancel}
        title="Permanently delete?"
        description={`Are you sure you want to permanently delete ${selectedParticipantName || 'this participant'}? This action cannot be undone.`}
        acceptText="Delete"
        cancelText="Cancel"
      />
      <Box component="section" className="mb-6 w-full px-6">
        <NoSsr>
          <DataGrid
            sx={{
              '.MuiTablePagination-displayedRows': { display: 'none' },
            }}
            columns={[
              {
                field: 'id',
                headerName: 'ID',
                flex: 1,
                minWidth: 300,
              },
              {
                field: 'userName',
                headerName: 'Name',
                flex: 2,
                minWidth: 200,
              },
              {
                field: 'stage',
                headerName: 'Stage',
                flex: 1,
                minWidth: 150,
                renderCell: (params) => <ParticipantStageBadge stage={params.value} />,
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
                      href={`/submissions/${params.row.submissionId}/participants/${params.row.actions.id}`}
                    />
                    <GridActionsCellItem
                      key="edit"
                      showInMenu
                      icon={<EditRounded />}
                      label="Edit"
                      component={Link}
                      // @ts-expect-error Link component requires href prop but it does not exposed as a prop for some reason. Read more on https://github.com/mui/mui-x/issues/9913
                      href={`/submissions/${params.row.submissionId}/participants/${params.row.actions.id}`}
                    />
                    <GridActionsCellItem
                      key="delete"
                      showInMenu
                      icon={<DeleteRounded />}
                      label="Delete"
                      onClick={() =>
                        handleDeleteClick(
                          params.row.actions.id,
                          params.row.actions.user?.name ?? 'this participant',
                        )
                      }
                    />
                  </GridActionsCell>
                ),
              },
            ]}
            rows={initParticipants.map((participant) => ({
              id: participant.id,
              userName: participant.user?.name ?? 'Unknown',
              stage: participant.stage,
              submissionId: participant.submissionId,
              actions: participant,
            }))}
            slots={{
              noRowsOverlay: EmptyRowOverlay as GridSlots['noRowsOverlay'],
            }}
            slotProps={{
              noRowsOverlay: { text: 'No participants found.' },
            }}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  id: false,
                },
              },
            }}
            disableRowSelectionOnClick
            hideFooter
          />
        </NoSsr>
      </Box>
    </>
  );
}
