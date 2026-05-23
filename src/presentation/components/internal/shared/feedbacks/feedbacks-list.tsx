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
import { VisibilityRounded, EditRounded } from '@mui/icons-material';
import {
  EmptyRowOverlay,
  FeedbackRecommendationBadge,
} from '@app/presentation/components/internal/shared';
import type { FeedbackDto } from '@app/infrastructure/dtos';
import { useRouter } from 'next/navigation';

type Props = {
  submissionId: string;
  revisionId: string;
  feedbacks: FeedbackDto[];
  currentUserId?: string;
  userParticipantStages?: string[];
  revisionCurrentStage?: string;
};

export function FeedbacksList({
  submissionId,
  revisionId,
  feedbacks,
  currentUserId,
  userParticipantStages = [],
  revisionCurrentStage,
}: Props) {
  const router = useRouter();

  const handleRowClick = (params: GridRowParams) => {
    router.push(`/submissions/${submissionId}/revisions/${revisionId}/feedbacks/${params.row.id}`);
  };

  const canEdit = (feedback: FeedbackDto) => {
    if (!currentUserId || !revisionCurrentStage) {
      return false;
    }

    // User must be the author of the feedback
    if (feedback.author_id !== currentUserId) {
      return false;
    }

    // User must have a participant assignment matching the revision's current stage
    if (!userParticipantStages.includes(revisionCurrentStage)) {
      return false;
    }

    return true;
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
              field: 'content',
              headerName: 'Content',
              flex: 2,
              minWidth: 300,
            },
            {
              field: 'recommendation',
              headerName: 'Recommendation',
              flex: 1,
              minWidth: 150,
              renderCell: (params) => <FeedbackRecommendationBadge recommendation={params.value} />,
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
                    href={`/submissions/${submissionId}/revisions/${revisionId}/feedbacks/${params.row.actions.id}`}
                  />
                  {canEdit(params.row.actions) && (
                    <GridActionsCellItem
                      key="edit"
                      showInMenu
                      icon={<EditRounded />}
                      label="Edit"
                      component={Link}
                      // @ts-expect-error Link component requires href prop but it does not exposed as a prop for some reason. Read more on https://github.com/mui/mui-x/issues/9913
                      href={`/submissions/${submissionId}/revisions/${revisionId}/feedbacks/${params.row.actions.id}/edit`}
                    />
                  )}
                </GridActionsCell>
              ),
            },
          ]}
          rows={feedbacks.map((feedback) => ({
            id: feedback.id,
            content:
              feedback.content.length > 80
                ? `${feedback.content.slice(0, 80)}...`
                : feedback.content,
            recommendation: feedback.recommendation,
            actions: feedback,
          }))}
          slots={{
            noRowsOverlay: EmptyRowOverlay as GridSlots['noRowsOverlay'],
          }}
          slotProps={{
            noRowsOverlay: { text: 'No feedbacks found.' },
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
