'use client';

import { AddRounded } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import Link from 'next/link';
import type { ParticipantDto, RevisionDto } from '@app/infrastructure/dtos';

type Props = {
  submissionId: string;
  revisionId: string;
  revision: RevisionDto;
  participants?: ParticipantDto[];
  currentUserId?: string;
  role?: string;
};

export function FeedbacksToolbar({
  submissionId,
  revisionId,
  revision,
  participants,
  currentUserId,
  role,
}: Props) {
  const canCreateFeedback = () => {
    if (!currentUserId) {
      return false;
    }

    if (!participants || participants.length === 0) {
      return false;
    }

    if (revision.is_frozen) {
      return false;
    }

    // Only EDITOR and REVIEWER can create feedback
    if (role !== 'EDITOR' && role !== 'REVIEWER') {
      return false;
    }

    // Find all participant assignments for the current user
    const userParticipants = participants.filter((p) => p.user_id === currentUserId);

    if (userParticipants.length === 0) {
      return false;
    }

    // Check if ANY of the user's participant assignments match the criteria
    for (const userParticipant of userParticipants) {
      const participantStage = userParticipant.stage;
      const revisionCurrentStage = revision.current_stage;

      // Check if participant stage matches revision current stage
      if (participantStage !== revisionCurrentStage) {
        continue;
      }

      // For REVIEWER: only allow if stage is REVIEW or FINAL_REVIEW
      if (role === 'REVIEWER' && !['REVIEW', 'FINAL_REVIEW'].includes(participantStage)) {
        continue;
      }

      // For EDITOR: only allow if stage is EDIT, COPY_EDIT, LAYOUT_EDIT
      if (role === 'EDITOR' && !['EDIT', 'COPY_EDIT', 'LAYOUT_EDIT'].includes(participantStage)) {
        continue;
      }

      return true;
    }

    return false;
  };

  const showAddButton = canCreateFeedback();

  if (showAddButton) {
    return (
      <Box className="ml-auto">
        <Button
          variant="filled"
          className="ml-4"
          aria-label="Add feedback"
          LinkComponent={Link}
          href={`/submissions/${submissionId}/revisions/${revisionId}/feedbacks/new`}
          startIcon={<AddRounded />}
        >
          Add Feedback
        </Button>
      </Box>
    );
  } else {
    return null;
  }
}
