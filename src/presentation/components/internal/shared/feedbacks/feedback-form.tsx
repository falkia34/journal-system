'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { FeedbackMapper, FeedbackDto } from '@app/infrastructure/dtos';
import {
  createFeedbackAction,
  updateFeedbackAction,
  FeedbackActionState,
} from '@app/presentation/actions';
import { SectionHeader, PdfViewer } from '@app/presentation/components/internal/shared';
import { useActionState, useTransition } from 'react';
import { FeedbackInput, feedbackInputSchema } from '@app/presentation/schemas';
import { SaveRounded, AttachFileRounded, DeleteRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatBytes } from '@app/utils';
import { visuallyHidden } from '@mui/utils';
import { ChangeEvent } from 'react';
import { Feedback } from '@app/domain/entities';

type Props = {
  initialFeedback?: FeedbackDto;
  submissionId: string;
  revisionId: string;
  stage: string;
  authorId: string;
};

export function FeedbackForm({
  initialFeedback,
  submissionId,
  revisionId,
  stage,
  authorId,
}: Props) {
  const [state, formAction] = useActionState<FeedbackActionState, FormData>(
    initialFeedback ? updateFeedbackAction : createFeedbackAction,
    null,
  );
  const [isPending, startTransition] = useTransition();

  const feedback = useMemo(
    () => (initialFeedback ? FeedbackMapper.fromDtoToDomain(initialFeedback) : null),
    [initialFeedback],
  );
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackInputSchema) as Resolver<FeedbackInput>,
    defaultValues: feedback
      ? {
          submissionId: feedback.submissionId,
          revisionId: feedback.revisionId,
          authorId: feedback.authorId,
          file: feedback.file ? `/feedbacks/${feedback.file}` : null,
          content: feedback.content,
          stage: feedback.stage,
          recommendation: feedback.recommendation,
        }
      : {
          submissionId,
          revisionId,
          authorId,
          file: null,
          content: '',
          stage,
          recommendation: 'CONTINUE',
        },
  });

  const {
    handleSubmit,
    formState: { isDirty, errors },
    control,
    register,
    getValues,
  } = methods;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        const currentFile = getValues('file');
        const formData = FeedbackMapper.fromDomainToFormData({
          id: feedback?.id,
          submissionId: data.submissionId,
          revisionId: data.revisionId,
          authorId: authorId,
          content: data.content,
          stage: data.stage as Feedback['stage'],
          recommendation: data.recommendation as Feedback['recommendation'],
          file: typeof currentFile === 'string' ? currentFile : null,
        });

        if (data.file instanceof File) {
          formData.set('file', data.file);
        }

        handleFormAction(formData);
      }
    },
    [isDirty, feedback?.id, authorId, getValues, handleFormAction],
  );

  const router = useRouter();

  return (
    <>
      <SectionHeader title={feedback ? 'Edit Feedback' : 'Add Feedback'}>
        <Box className="ml-auto flex flex-wrap-reverse justify-end gap-y-2">
          <Button
            variant="text"
            className="ml-4"
            aria-label="Cancel"
            disabled={isPending}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            className="ml-4"
            aria-label="Save feedback"
            startIcon={<SaveRounded />}
            disabled={!isDirty || isPending}
            onClick={() => ref.current?.requestSubmit()}
          >
            Save
          </Button>
        </Box>
      </SectionHeader>
      <Box component="form" ref={ref} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Box component="section" className="mb-4 w-full px-6">
          <Container maxWidth={false} className="max-w-2xl p-0">
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  {...register('content')}
                  label="Content"
                  multiline
                  rows={5}
                  error={!!errors.content || !!state?.errors?.content}
                  helperText={errors.content?.message || state?.errors?.content?.join(', ')}
                  fullWidth
                  disabled={isPending}
                />
              </Grid>
              <Grid size={12}>
                <FormControl
                  fullWidth
                  margin="none"
                  disabled={isPending}
                  error={!!errors.recommendation || !!state?.errors?.recommendation}
                >
                  <InputLabel id="recommendation-label">Recommendation</InputLabel>
                  <Controller
                    name="recommendation"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select {...field} labelId="recommendation-label" label="Recommendation">
                        <MenuItem value="CONTINUE">Continue</MenuItem>
                        <MenuItem value="REJECT">Reject</MenuItem>
                        <MenuItem value="REVISE">Revise</MenuItem>
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    {errors.recommendation?.message || state?.errors?.recommendation?.join(', ')}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth margin="none" disabled={isPending}>
                  <FormLabel
                    component="label"
                    htmlFor="file"
                    error={!!errors.file}
                    className="px-3"
                  >
                    Supporting Document (Optional)
                  </FormLabel>
                  <Controller
                    name="file"
                    control={control}
                    render={({ field: { value, ref, onChange, ...field } }) => (
                      <>
                        <Box
                          role="button"
                          tabIndex={0}
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              fileInputRef.current?.click();
                            }
                          }}
                          onDragEnter={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={(event) => {
                            event.preventDefault();
                            setIsDragging(false);
                          }}
                          onDragOver={(event) => {
                            event.preventDefault();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            setIsDragging(false);

                            const file = event.dataTransfer.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                          sx={(theme) => ({
                            border: '1px dashed',
                            borderColor: isDragging
                              ? theme.vars?.palette.primary.main
                              : errors.file
                                ? theme.vars?.palette.error.main
                                : theme.vars?.palette.outline,
                            borderRadius: 1,
                            px: 3,
                            py: 4,
                            bgcolor: isDragging ? 'primaryContainer.main' : 'transparent',
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            opacity: isPending ? 0.7 : 1,
                            transition: theme.transitions.create([
                              'border-color',
                              'background-color',
                            ]),
                          })}
                          className="mt-2 flex flex-col items-center gap-1 text-center"
                        >
                          <AttachFileRounded
                            fontSize="large"
                            sx={(theme) => ({
                              color: isDragging
                                ? theme.vars?.palette.onSurfaceVariant.main
                                : errors.file
                                  ? theme.vars?.palette.error.main
                                  : theme.vars?.palette.onSurfaceVariant.main,
                            })}
                            className="pointer-events-none"
                          />
                          <Typography
                            variant="body1"
                            sx={(theme) => ({
                              color: isDragging
                                ? theme.vars?.palette.onSurfaceVariant.main
                                : errors.file
                                  ? theme.vars?.palette.error.main
                                  : theme.vars?.palette.onSurfaceVariant.main,
                            })}
                            className="pointer-events-none mt-2"
                          >
                            Drag and drop or
                            <Typography
                              component="span"
                              variant="body1"
                              sx={(theme) => ({
                                color: isDragging
                                  ? theme.vars?.palette.primary.main
                                  : errors.file
                                    ? theme.vars?.palette.error.main
                                    : theme.vars?.palette.primary.main,
                              })}
                              className="pointer-events-none font-semibold"
                            >
                              {' '}
                              click{' '}
                            </Typography>
                            to browse
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={(theme) => ({
                              color: isDragging
                                ? theme.vars?.palette.onSurfaceVariant.main
                                : errors.file
                                  ? theme.vars?.palette.error.main
                                  : theme.vars?.palette.onSurfaceVariant.main,
                            })}
                            className="pointer-events-none"
                          >
                            Allowed file type: PDF. Allowed size: up to 50MB.
                          </Typography>
                          <Input
                            {...field}
                            id="file"
                            type="file"
                            inputProps={{
                              accept: 'application/pdf',
                            }}
                            inputRef={(element) => {
                              ref(element);
                              fileInputRef.current = element;
                            }}
                            disabled={isPending}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                            sx={visuallyHidden}
                            className="pointer-events-none"
                          />
                        </Box>
                        {value ? (
                          <Box
                            sx={{
                              width: '100%',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'outline',
                            }}
                            className="mt-4 p-4"
                          >
                            <PdfViewer
                              file={value instanceof File ? value : `/blobs/feedbacks/${value}`}
                              title="Supporting Document Preview"
                              height={500}
                            />
                            <Box className="mt-2 flex flex-row items-center justify-between gap-2">
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="onSurfaceVariant.main"
                                  className="font-semibold"
                                >
                                  {value instanceof File
                                    ? value.name
                                    : typeof value === 'string'
                                      ? (value.split('/').pop() ?? 'Current document')
                                      : 'Current document'}
                                </Typography>
                                {value instanceof File ? (
                                  <Typography variant="body2" color="onSurfaceVariant.main">
                                    Size: {formatBytes(value.size)}
                                  </Typography>
                                ) : typeof value === 'string' ? (
                                  <Typography variant="body2" color="onSurfaceVariant.main">
                                    Current document
                                  </Typography>
                                ) : null}
                              </Box>
                              <IconButton
                                disabled={isPending}
                                onClick={() => {
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                  onChange(null);
                                }}
                              >
                                <DeleteRounded />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : null}
                      </>
                    )}
                  />
                  <FormHelperText error={!!errors.file}>
                    {errors.file?.message || state?.errors?.file?.join(', ')}
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
