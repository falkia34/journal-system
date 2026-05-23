'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Box, Container, Grid, TextField } from '@mui/material';
import { JournalDto, JournalMapper } from '@app/infrastructure/dtos';
import {
  createJournalAction,
  updateJournalAction,
  JournalActionState,
} from '@app/presentation/actions';
import { useActionState, useTransition } from 'react';
import { JournalToolbar } from './journal-toolbar';
import { JournalInput, journalInputSchema } from '@app/presentation/schemas';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { getUsersAction } from '@app/presentation/actions/user.actions';
import { User } from '@app/domain/entities';
import { UserMapper } from '@app/infrastructure/dtos';

type Props = {
  initialJournal?: JournalDto;
};

export function JournalForm({ initialJournal }: Props) {
  const [state, formAction] = useActionState<JournalActionState, FormData>(
    initialJournal ? updateJournalAction : createJournalAction,
    null,
  );
  const [isPending, startTransition] = useTransition();

  const journal = useMemo(
    () => (initialJournal ? JournalMapper.fromDtoToDomain(initialJournal) : null),
    [initialJournal],
  );
  const initialEditorInChief = useMemo(
    () => journal?.editorInChief ?? null,
    [journal?.editorInChief],
  );
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<JournalInput>({
    resolver: zodResolver(journalInputSchema) as Resolver<JournalInput>,
    defaultValues: journal
      ? {
          name: journal.name,
          description: journal.description,
          editorInChiefId: journal.editorInChiefId,
        }
      : {
          name: '',
          description: '',
          editorInChiefId: '',
        },
  });

  const {
    handleSubmit,
    formState: { isDirty, errors },
    register,
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
        const formData = JournalMapper.fromDomainToFormData({
          id: journal?.id,
          ...data,
        });

        handleFormAction(formData);
      }
    },
    [isDirty, journal?.id, handleFormAction],
  );

  const [userInput, setUserInput] = useState(initialEditorInChief?.name ?? '');
  const [userOptions, setUserOptions] = useState<User[]>(
    initialEditorInChief ? [initialEditorInChief] : [],
  );
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
      <SectionHeader title={journal ? journal.name : 'Create Journal'}>
        <JournalToolbar formRef={ref} methods={methods} />
      </SectionHeader>
      <Box component="form" ref={ref} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Box component="section" className="mb-4 w-full px-6">
          <Container maxWidth={false} className="max-w-2xl p-0">
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  {...register('name')}
                  label="Name"
                  fullWidth
                  margin="none"
                  error={!!errors.name || !!state?.errors?.name}
                  helperText={errors.name?.message || state?.errors?.name?.join(', ')}
                  disabled={isPending}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...register('description')}
                  label="Description"
                  fullWidth
                  margin="none"
                  multiline
                  rows={3}
                  error={!!errors.description || !!state?.errors?.description}
                  helperText={errors.description?.message || state?.errors?.description?.join(', ')}
                  disabled={isPending}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="editorInChiefId"
                  control={control}
                  defaultValue=""
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
                          label="Editor-in-Chief"
                          fullWidth
                          margin="none"
                          error={!!errors.editorInChiefId || !!state?.errors?.editorInChiefId}
                          helperText={
                            errors.editorInChiefId?.message ||
                            state?.errors?.editorInChiefId?.join(', ')
                          }
                          disabled={isPending}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}
