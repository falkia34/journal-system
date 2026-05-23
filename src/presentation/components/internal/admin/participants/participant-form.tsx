'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Box,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { ParticipantDto, ParticipantMapper, UserMapper } from '@app/infrastructure/dtos';
import { Participant, User } from '@app/domain/entities';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { useActionState, useTransition } from 'react';
import { ParticipantInput, participantInputSchema } from '@app/presentation/schemas';
import { ParticipantToolbar } from './participant-toolbar';
import {
  updateParticipantAction,
  createParticipantAction,
  ParticipantActionState,
} from '@app/presentation/actions';
import { getUsersAction } from '@app/presentation/actions/user.actions';

const stageOptions = ['REVIEW', 'EDIT', 'COPY_EDIT', 'LAYOUT_EDIT', 'FINAL_REVIEW'];

type Props = {
  initialParticipant?: ParticipantDto;
  submissionId?: string;
};

export function ParticipantForm({ initialParticipant, submissionId }: Props) {
  const [state, formAction] = useActionState<ParticipantActionState, FormData>(
    initialParticipant ? updateParticipantAction : createParticipantAction,
    null,
  );
  const [isPending, startTransition] = useTransition();

  const participant = useMemo(
    () => (initialParticipant ? ParticipantMapper.fromDtoToDomain(initialParticipant) : null),
    [initialParticipant],
  );
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<ParticipantInput>({
    resolver: zodResolver(participantInputSchema) as Resolver<ParticipantInput>,
    defaultValues: participant
      ? {
          submissionId: participant.submissionId,
          userId: participant.userId,
          stage: participant.stage,
        }
      : {
          submissionId: submissionId || '',
          userId: '',
          stage: '',
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
          id: participant?.id,
          ...data,
          stage: data.stage as Participant['stage'],
        });

        handleFormAction(formData);
      }
    },
    [isDirty, participant?.id, handleFormAction],
  );

  const initialUser = useMemo(() => {
    if (participant?.userId) {
      return participant.user ?? null;
    }
    return null;
  }, [participant?.userId, participant?.user]);

  const [userInput, setUserInput] = useState(initialUser?.name ?? '');
  const [userOptions, setUserOptions] = useState<User[]>(initialUser ? [initialUser] : []);
  const [isUserLoading, setIsUserLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const query = userInput.trim();

    if (query.length < 1) {
      return () => {
        active = false;
      };
    }

    const timeoutId = setTimeout(async () => {
      setIsUserLoading(true);

      const usersResult = await getUsersAction({ name: query }, undefined, 10);

      if (!active) return;

      if ('errors' in usersResult) {
        setUserOptions([]);
      } else {
        setUserOptions(usersResult.users.map(UserMapper.fromDtoToDomain));
      }

      setIsUserLoading(false);
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [userInput]);

  return (
    <>
      <SectionHeader
        title={
          participant
            ? `${participant.user?.name ?? 'Unknown'} - ${participant.stage}`
            : 'Add Participant'
        }
      >
        <ParticipantToolbar ref={ref} methods={methods} />
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
                  <Controller
                    name="userId"
                    control={control}
                    defaultValue={''}
                    render={({ field }) => (
                      <Autocomplete
                        options={userOptions}
                        value={userOptions.find((user) => user.id === field.value) ?? null}
                        onChange={(_, user) => {
                          field.onChange(user?.id ?? '');
                        }}
                        inputValue={userInput}
                        onInputChange={(_, value) => {
                          setUserInput(value);

                          if (value.trim().length < 1) {
                            setUserOptions([]);
                            setIsUserLoading(false);
                          }
                        }}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                        loading={isUserLoading}
                        disabled={isPending}
                        noOptionsText={userInput ? 'No users found' : 'Type to search users'}
                        filterOptions={(options) => options}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            id="userId"
                            label="User"
                            fullWidth
                            margin="none"
                            error={!!errors.userId || !!state?.errors?.userId}
                          />
                        )}
                      />
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
                        {stageOptions.map((stage) => (
                          <MenuItem key={stage} value={stage}>
                            {stage
                              .toLowerCase()
                              .split('_')
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')}
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
