'use client';

import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
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
  TextField,
} from '@mui/material';
import { IssueMapper, IssueDto, JournalDto, JournalMapper } from '@app/infrastructure/dtos';
import { getJournalsAction } from '@app/presentation/actions/journal.actions';
import { Journal } from '@app/domain/entities';
import { createIssueAction, updateIssueAction, IssueActionState } from '@app/presentation/actions';
import { useActionState, useTransition } from 'react';
import { IssueToolbar } from './issue-toolbar';
import { IssueInput, issueInputSchema } from '@app/presentation/schemas';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { LocalizationProvider } from '@mui/x-date-pickers';

type Props = {
  initialIssue?: IssueDto;
  journals: JournalDto[];
};

export function IssueForm({ initialIssue, journals }: Props) {
  const [state, formAction] = useActionState<IssueActionState, FormData>(
    initialIssue ? updateIssueAction : createIssueAction,
    null,
  );
  const [isPending, startTransition] = useTransition();
  const parsedJournals = useMemo(() => journals.map(JournalMapper.fromDtoToDomain), [journals]);

  const issue = useMemo(
    () => (initialIssue ? IssueMapper.fromDtoToDomain(initialIssue) : null),
    [initialIssue],
  );
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<IssueInput>({
    resolver: zodResolver(issueInputSchema) as Resolver<IssueInput>,
    defaultValues: issue
      ? {
          ...issue,
        }
      : {
          journalId: '',
          volume: 1,
          number: 1,
          title: null,
          description: null,
          publishedAt: null,
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
        const formData = IssueMapper.fromDomainToFormData({
          id: issue?.id,
          ...data,
        });

        handleFormAction(formData);
      }
    },
    [isDirty, issue?.id, handleFormAction],
  );

  const initialJournal = useMemo(
    () => issue?.journal ?? parsedJournals.find((j) => j.id === issue?.journalId) ?? null,
    [issue?.journal, issue?.journalId, parsedJournals],
  );

  const [journalInput, setJournalInput] = useState(initialJournal?.name ?? '');
  const [journalOptions, setJournalOptions] = useState<Journal[]>(
    initialJournal ? [initialJournal] : [],
  );
  const [isJournalLoading, setIsJournalLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const query = journalInput.trim();

    if (query.length < 1) {
      return () => {
        active = false;
      };
    }

    const timeoutId = setTimeout(async () => {
      setIsJournalLoading(true);

      const journalsResult = await getJournalsAction(undefined, { name: query }, undefined, 10);

      if (!active) return;

      if ('errors' in journalsResult) {
        setJournalOptions([]);
      } else {
        setJournalOptions(journalsResult.journals.map(JournalMapper.fromDtoToDomain));
      }

      setIsJournalLoading(false);
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [journalInput]);

  return (
    <>
      <SectionHeader
        title={
          issue
            ? `${issue.journal?.name ? issue.journal.name + ' ' : ''}Issue Vol. ${issue.volume} No. ${issue.number}`
            : 'Create Issue'
        }
      >
        <IssueToolbar ref={ref} methods={methods} />
      </SectionHeader>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Box component="form" ref={ref} noValidate onSubmit={handleSubmit(onSubmit)}>
          <Box component="section" className="mb-4 w-full px-6">
            <Container maxWidth={false} className="max-w-2xl p-0">
              <Grid container spacing={2}>
                <Grid size={12}>
                  <FormControl
                    fullWidth
                    margin="none"
                    disabled={isPending}
                    error={!!errors.journalId || !!state?.errors?.journalId}
                  >
                    <Controller
                      name="journalId"
                      control={control}
                      defaultValue={''}
                      render={({ field }) => (
                        <Autocomplete
                          options={journalOptions}
                          value={
                            journalOptions.find((journal) => journal.id === field.value) ?? null
                          }
                          onChange={(_, journal) => {
                            field.onChange(journal?.id ?? '');
                          }}
                          inputValue={journalInput}
                          onInputChange={(_, value) => {
                            setJournalInput(value);

                            if (value.trim().length < 1) {
                              setJournalOptions([]);
                              setIsJournalLoading(false);
                            }
                          }}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) => option.id === value?.id}
                          loading={isJournalLoading}
                          disabled={isPending}
                          noOptionsText={
                            journalInput ? 'No journals found' : 'Type to search journals'
                          }
                          filterOptions={(options) => options}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              id="journalId"
                              label="Journal"
                              fullWidth
                              margin="none"
                              error={!!errors.journalId || !!state?.errors?.journalId}
                            />
                          )}
                        />
                      )}
                    />
                    <FormHelperText>
                      {errors.journalId?.message || state?.errors?.journalId?.join(', ')}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <TextField
                    {...register('volume', { valueAsNumber: true })}
                    label="Volume"
                    type="number"
                    error={!!errors.volume || !!state?.errors?.volume}
                    helperText={errors.volume?.message || state?.errors?.volume?.join(', ')}
                    fullWidth
                    disabled={isPending}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    {...register('number', { valueAsNumber: true })}
                    label="Number"
                    type="number"
                    error={!!errors.number || !!state?.errors?.number}
                    helperText={errors.number?.message || state?.errors?.number?.join(', ')}
                    fullWidth
                    disabled={isPending}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    {...register('title')}
                    label="Title"
                    error={!!errors.title || !!state?.errors?.title}
                    helperText={errors.title?.message || state?.errors?.title?.join(', ')}
                    fullWidth
                    disabled={isPending}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    {...register('description')}
                    label="Description"
                    multiline
                    rows={3}
                    error={!!errors.description || !!state?.errors?.description}
                    helperText={
                      errors.description?.message || state?.errors?.description?.join(', ')
                    }
                    fullWidth
                    disabled={isPending}
                  />
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </LocalizationProvider>
    </>
  );
}
