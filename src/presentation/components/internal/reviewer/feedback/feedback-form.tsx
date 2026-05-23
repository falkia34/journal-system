'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
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
import {
  createFeedbackAction,
  updateFeedbackAction,
  FeedbackActionState,
} from '@app/presentation/actions';
import { useActionState, useTransition } from 'react';
import { FeedbackToolbar } from './feedback-toolbar';
import { FeedbackInput, feedbackInputSchema } from '@app/presentation/schemas';
import { SectionHeader, PdfViewer } from '@app/presentation/components/internal/shared';
import { AttachFileRounded, DeleteRounded } from '@mui/icons-material';
import { formatBytes } from '@app/utils';
import { visuallyHidden } from '@mui/utils';
import { ChangeEvent } from 'react';

type Props = {
  initialFeedback?: {
    id: string;
    content: string;
    stage: string;
    recommendation: string;
  };
  submissionId: string;
  revisionId: string;
};

const stageOptions = ['REVIEW', 'EDIT', 'COPY_EDIT', 'LAYOUT_EDIT', 'FINAL_REVIEW'];
const recommendationOptions = ['CONTINUE', 'REJECT', 'REVISE'];

export function FeedbackForm({ initialFeedback, submissionId, revisionId }: Props) {
  const [state, formAction] = useActionState<FeedbackActionState, FormData>(
    initialFeedback ? updateFeedbackAction : createFeedbackAction,
    null,
  );
  const [isPending, startTransition] = useTransition();

  const feedback = useMemo(() => initialFeedback ?? null, [initialFeedback]);
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackInputSchema) as Resolver<FeedbackInput>,
    defaultValues: feedback
      ? {
          submissionId,
          revisionId,
          authorId: '',
          file: null,
          content: feedback.content,
          stage: feedback.stage,
          recommendation: feedback.recommendation,
        }
      : {
          submissionId,
          revisionId,
          authorId: '',
          file: null,
          content: '',
          stage: '',
          recommendation: '',
        },
  });

  const {
    handleSubmit,
    formState: { isDirty, errors },
    register,
    control,
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
        const formData = new FormData();
        if (feedback?.id) formData.append('id', feedback.id);
        formData.append('submissionId', data.submissionId);
        formData.append('revisionId', data.revisionId);
        formData.append('authorId', data.authorId);
        if (data.file instanceof File) {
          formData.append('file', data.file);
        } else if (typeof data.file === 'string') {
          formData.append('file', data.file);
        }
        formData.append('content', data.content);
        formData.append('stage', data.stage);
        formData.append('recommendation', data.recommendation);

        handleFormAction(formData);
      }
    },
    [isDirty, feedback, handleFormAction],
  );

  return (
    <>
      <SectionHeader title={feedback ? 'Edit Feedback' : 'Create Feedback'}>
        <FeedbackToolbar ref={ref} methods={methods} />
      </SectionHeader>
      <Box component="form" ref={ref} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Box component="section" className="mb-4 w-full px-6">
          <Container maxWidth={false} className="max-w-2xl p-0">
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  {...register('content')}
                  label="Content"
                  fullWidth
                  margin="none"
                  multiline
                  rows={4}
                  error={!!errors.content || !!state?.errors?.content}
                  helperText={errors.content?.message || state?.errors?.content?.join(', ')}
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
                        <MenuItem key="empty" value="" disabled sx={{ display: 'none' }}>
                          Select recommendation
                        </MenuItem>
                        {recommendationOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    {errors.recommendation?.message || state?.errors?.recommendation?.join(', ')}
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
                            Allowed file type: PDF. Allowed size: up to 50MB. Optional.
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
                                  {value instanceof File ? value.name : 'Current document'}
                                </Typography>
                                {value instanceof File ? (
                                  <Typography variant="body2" color="onSurfaceVariant.main">
                                    Size: {formatBytes(value.size)}
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
