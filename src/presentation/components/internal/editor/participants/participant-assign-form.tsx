'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { createParticipantAction, ParticipantActionState } from '@app/presentation/actions';
import { participantInputSchema } from '@app/presentation/schemas/participant.schema';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { useActionState, useTransition } from 'react';
import { ParticipantInput } from '@app/presentation/schemas';
import { ParticipantAssignToolbar } from './participant-assign-toolbar';
import { ParticipantMapper } from '@app/infrastructure/dtos';
import { Participant } from '@app/domain/entities';

const stageOptions: ParticipantInput['stage'][] = [
  'REVIEW',
  'EDIT',
  'COPY_EDIT',
  'LAYOUT_EDIT',
  'FINAL_REVIEW',
];

type Props = {
  submissionId: string;
  users: { id: string; name: string }[];
};

export function ParticipantAssignForm({ submissionId, users }: Props) {
  const [state, formAction] = useActionState<ParticipantActionState, FormData>(
    createParticipantAction,
    null,
  );
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<ParticipantInput>({
    resolver: zodResolver(participantInputSchema) as Resolver<ParticipantInput>,
    defaultValues: {
      submissionId,
      userId: '',
      stage: '' as ParticipantInput['stage'],
    },
  });

  const {
    handleSubmit,
    formState: { isDirty, errors },
    control,
  } = methods;

  const handleFormAction = useMemo(
    () => (formData: FormData) => {
      startTransition(() => {
        formAction(formData);
      });
    },
    [formAction, startTransition],
  );

  const onSubmit = useCallback(
    (data: Parameters<Parameters<typeof handleSubmit>[0]>[0]) => {
      if (isDirty) {
        const formData = ParticipantMapper.fromDomainToFormData({
          ...data,
          stage: data.stage as Participant['stage'],
        });

        handleFormAction(formData);
      }
    },
    [isDirty, handleFormAction],
  );

  return (
    <>
      <SectionHeader title="Assign Participant">
        <ParticipantAssignToolbar ref={ref} methods={methods} />
      </SectionHeader>
      <Box component="form" ref={ref} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Box component="section" className="mb-4 w-full px-6">
          <Container maxWidth={false} className="max-w-2xl p-0">
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControl
                  fullWidth
                  margin="none"
                  disabled={isPending}
                  error={!!errors.userId || !!state?.errors?.userId}
                >
                  <InputLabel id="userId-label">User</InputLabel>
                  <Controller
                    name="userId"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select {...field} labelId="userId-label" label="User">
                        <MenuItem key="empty" value="" disabled sx={{ display: 'none' }}>
                          Select user
                        </MenuItem>
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    {errors.userId?.message || state?.errors?.userId?.join(', ')}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl
                  fullWidth
                  margin="none"
                  disabled={isPending}
                  error={!!errors.stage || !!state?.errors?.stage}
                >
                  <InputLabel id="stage-label">Stage</InputLabel>
                  <Controller
                    name="stage"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select {...field} labelId="stage-label" label="Stage">
                        <MenuItem key="empty" value="" disabled sx={{ display: 'none' }}>
                          Select stage
                        </MenuItem>
                        {stageOptions.map((stage) => (
                          <MenuItem key={stage} value={stage}>
                            {stage}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    {errors.stage?.message || state?.errors?.stage?.join(', ')}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}
