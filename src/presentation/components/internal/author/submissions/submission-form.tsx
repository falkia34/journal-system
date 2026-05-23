'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Box, Chip, Container, Grid, TextField } from '@mui/material';
import {
  SubmissionMapper,
  SubmissionDto,
  UserMapper,
  JournalMapper,
} from '@app/infrastructure/dtos';
import { Submission, User, Journal } from '@app/domain/entities';
import {
  createSubmissionAction,
  updateSubmissionAction,
  SubmissionActionState,
} from '@app/presentation/actions';
import { useActionState, useTransition, useEffect } from 'react';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { SubmissionInput, submissionInputSchema } from '@app/presentation/schemas';
import { SubmissionToolbar } from './submission-toolbar';
import { useInternalStore } from '@app/presentation/hooks';
import { getUsersAction } from '@app/presentation/actions/user.actions';
import { getJournalsAction } from '@app/presentation/actions/journal.actions';

type Props = {
  initialSubmission?: SubmissionDto;
};

export function SubmissionForm({ initialSubmission }: Props) {
  const [state, formAction] = useActionState<SubmissionActionState, FormData>(
    initialSubmission ? updateSubmissionAction : createSubmissionAction,
    null,
  );
  const [isPending, startTransition] = useTransition();
  const session = useInternalStore((s) => s.session);

  const submission = useMemo(
    () => (initialSubmission ? SubmissionMapper.fromDtoToDomain(initialSubmission) : null),
    [initialSubmission],
  );
  const initialJournal = useMemo(() => submission?.journal, [submission?.journal]);
  const initialAuthor = useMemo(() => submission?.author, [submission?.author]);

  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<SubmissionInput>({
    resolver: zodResolver(submissionInputSchema) as Resolver<SubmissionInput>,
    defaultValues: submission
      ? {
          authorId: submission.authorId,
          journalId: submission.journalId,
          title: submission.title,
          abstract: submission.abstract,
          authors: submission.authors,
          status: submission.status,
        }
      : {
          authorId: session?.activeRole === 'AUTHOR' ? session.user.id : '',
          journalId: '',
          title: '',
          abstract: '',
          authors: [],
          status: 'DRAFT',
        },
  });

  const {
    handleSubmit,
    formState: { isDirty, errors },
    register,
    control,
    setValue,
  } = methods;

  const [authorsInput, setAuthorsInput] = useState('');
  const [journalInput, setJournalInput] = useState(initialJournal?.name ?? '');
  const [userInput, setUserInput] = useState(initialAuthor?.name ?? '');
  const [journalOptions, setJournalOptions] = useState<Journal[]>(
    initialJournal ? [initialJournal] : [],
  );
  const [userOptions, setUserOptions] = useState<User[]>(initialAuthor ? [initialAuthor] : []);
  const [isJournalLoading, setIsJournalLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);

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

  useEffect(() => {
    let active = true;
    const query = userInput.trim();

    if (query.length < 1 || session?.activeRole !== 'ADMINISTRATOR') {
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
  }, [userInput, session?.activeRole]);

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
        const formData = SubmissionMapper.fromDomainToFormData({
          id: submission?.id,
          ...data,
          status: data.status as Submission['status'],
        });

        handleFormAction(formData);
      }
    },
    [isDirty, submission?.id, handleFormAction],
  );

  const handleAuthorsInputChange = useCallback(
    (newInputValue: string, onChange: (value: string[]) => void, currentValue: string[]) => {
      setAuthorsInput(newInputValue);

      if (newInputValue.endsWith(',')) {
        const newAuthor = newInputValue.slice(0, -1).trim();
        if (newAuthor && !currentValue.includes(newAuthor)) {
          const newAuthors = [...currentValue, newAuthor];

          onChange(newAuthors);
          setValue('authors', newAuthors, { shouldDirty: true });
          setAuthorsInput('');
        }
      }
    },
    [setValue],
  );

  return (
    <>
      <SectionHeader title={submission ? submission.title : 'Create Submission'}>
        <SubmissionToolbar ref={ref} methods={methods} />
      </SectionHeader>
      <Box component="form" ref={ref} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Box component="section" className="mb-4 w-full px-6">
          <Container maxWidth={false} className="max-w-2xl p-0">
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  {...register('title')}
                  label="Title"
                  fullWidth
                  margin="none"
                  error={!!errors.title || !!state?.errors?.title}
                  helperText={errors.title?.message || state?.errors?.title?.join(', ')}
                  disabled={isPending}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...register('abstract')}
                  label="Abstract"
                  fullWidth
                  margin="none"
                  multiline
                  rows={4}
                  error={!!errors.abstract || !!state?.errors?.abstract}
                  helperText={errors.abstract?.message || state?.errors?.abstract?.join(', ')}
                  disabled={isPending}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="journalId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Autocomplete
                      options={journalOptions}
                      value={journalOptions.find((journal) => journal.id === field.value) ?? null}
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
                      noOptionsText={journalInput ? 'No journals found' : 'Type to search journals'}
                      filterOptions={(options) => options}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Journal"
                          fullWidth
                          margin="none"
                          error={!!errors.journalId || !!state?.errors?.journalId}
                          helperText={
                            errors.journalId?.message || state?.errors?.journalId?.join(', ')
                          }
                          disabled={isPending}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              {session?.activeRole === 'ADMINISTRATOR' ? (
                <Grid size={12}>
                  <Controller
                    name="authorId"
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
                            label="Author"
                            fullWidth
                            margin="none"
                            error={!!errors.authorId || !!state?.errors?.authorId}
                            helperText={
                              errors.authorId?.message || state?.errors?.authorId?.join(', ')
                            }
                            disabled={isPending}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              ) : null}
              <Grid size={12}>
                <Controller
                  name="authors"
                  control={control}
                  defaultValue={[]}
                  render={({ field: { value, onChange } }) => (
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={value || []}
                      inputValue={authorsInput}
                      onChange={(_, newValue) => {
                        onChange(newValue);
                        setValue('authors', newValue, { shouldDirty: true });
                        setAuthorsInput('');
                      }}
                      onInputChange={(_, newInputValue, reason) => {
                        if (reason === 'input') {
                          handleAuthorsInputChange(newInputValue, onChange, value || []);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && authorsInput.trim()) {
                          e.preventDefault();
                          const newAuthors = [...(value || []), authorsInput.trim()];
                          onChange(newAuthors);
                          setValue('authors', newAuthors, { shouldDirty: true });
                          setAuthorsInput('');
                        }
                      }}
                      getOptionLabel={(option) => option}
                      isOptionEqualToValue={(option, val) => option === val}
                      disabled={isPending}
                      noOptionsText={
                        authorsInput
                          ? 'Press Enter or comma to add'
                          : 'Type author name and press Enter or comma'
                      }
                      filterOptions={(options, params) => {
                        const filtered = options.filter((option) =>
                          option.toLowerCase().includes(params.inputValue.toLowerCase()),
                        );
                        if (
                          params.inputValue !== '' &&
                          !filtered.some((opt) => opt === params.inputValue)
                        ) {
                          filtered.push(params.inputValue);
                        }
                        return filtered;
                      }}
                      renderValue={(selected, getItemProps) =>
                        selected.map((option, index) => {
                          const { key, ...itemProps } = getItemProps({ index });
                          return (
                            <Chip key={key} variant="outlined" label={option} {...itemProps} />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Authors"
                          fullWidth
                          margin="none"
                          placeholder="Type author name and press Enter or comma"
                          error={!!errors.authors || !!state?.errors?.authors}
                          helperText={errors.authors?.message || state?.errors?.authors?.join(', ')}
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
