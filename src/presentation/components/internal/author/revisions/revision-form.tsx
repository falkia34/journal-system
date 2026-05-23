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
  Toolbar,
  Typography,
} from '@mui/material';
import { RevisionMapper, RevisionDto } from '@app/infrastructure/dtos';
import { Revision } from '@app/domain/entities';
import {
  submitRevisionAction,
  updateRevisionAction,
  RevisionActionState,
} from '@app/presentation/actions';
import { useActionState, useTransition } from 'react';
import { RevisionToolbar } from './revision-toolbar';
import { RevisionInput, revisionInputSchema } from '@app/presentation/schemas';
import { SectionHeader, PdfViewer } from '@app/presentation/components/internal/shared';
import { AttachFileRounded, DeleteRounded } from '@mui/icons-material';
import { formatBytes } from '@app/utils';
import { visuallyHidden } from '@mui/utils';
import { ChangeEvent } from 'react';

type Props = {
  initialRevision?: RevisionDto;
  submissionId: string;
  version?: number;
  startStage?: string;
  currentStage?: string;
};

const stageOptions = [
  'DRAFT',
  'SUBMITTED',
  'REVIEW',
  'EDIT',
  'COPY_EDIT',
  'LAYOUT_EDIT',
  'FINAL_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'WITHDRAWN',
];

export function RevisionForm({
  initialRevision,
  submissionId,
  version,
  startStage,
  currentStage,
}: Props) {
  const [state, formAction] = useActionState<RevisionActionState, FormData>(
    initialRevision ? updateRevisionAction : submitRevisionAction,
    null,
  );
  const [isPending, startTransition] = useTransition();

  const revision = useMemo(
    () => (initialRevision ? RevisionMapper.fromDtoToDomain(initialRevision) : null),
    [initialRevision],
  );
  const ref = useRef<HTMLFormElement>(null);
  const isCreating = !initialRevision;
  const defaultVersion = version ?? 1;
  const defaultStartStage = (startStage as Revision['startStage']) ?? 'DRAFT';
  const defaultCurrentStage = (currentStage as Revision['currentStage']) ?? 'DRAFT';

  const methods = useForm<RevisionInput>({
    resolver: zodResolver(revisionInputSchema) as Resolver<RevisionInput>,
    defaultValues: revision
      ? {
          submissionId: revision.submissionId,
          file: revision.file,
          version: revision.version,
          startStage: revision.startStage,
          currentStage: revision.currentStage,
          isFrozen: revision.isFrozen,
        }
      : {
          submissionId,
          file: null,
          version: defaultVersion,
          startStage: defaultStartStage,
          currentStage: defaultCurrentStage,
          isFrozen: false,
        },
  });

  const {
    handleSubmit,
    formState: { isDirty, errors },
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
        const formData = RevisionMapper.fromDomainToFormData({
          id: revision?.id,
          submissionId: data.submissionId,
          file: data.file instanceof File ? data.file : (data.file ?? undefined),
          version: data.version ?? defaultVersion,
          startStage: (data.startStage as Revision['startStage']) ?? defaultStartStage,
          currentStage: (data.currentStage as Revision['currentStage']) ?? defaultCurrentStage,
          isFrozen: data.isFrozen ?? false,
        });

        handleFormAction(formData);
      }
    },
    [
      isDirty,
      revision?.id,
      defaultVersion,
      defaultStartStage,
      defaultCurrentStage,
      handleFormAction,
    ],
  );

  return (
    <>
      <SectionHeader title={revision ? `Revision v${revision.version}` : 'Submit Revision'}>
        <RevisionToolbar ref={ref} methods={methods} />
      </SectionHeader>
      <Box component="form" ref={ref} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Box component="section" className="mb-6 w-full px-6">
          <Container maxWidth={false} className="max-w-2xl p-0">
            <Toolbar component="header" className="h-auto min-h-10 p-3">
              <Typography component="h2" variant="h6" className="font-medium">
                Document
              </Typography>
            </Toolbar>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControl fullWidth margin="none" disabled={isPending}>
                  <FormLabel
                    component="label"
                    htmlFor="file"
                    error={!!errors.file}
                    className="px-3"
                  >
                    Revision File
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
                              file={value instanceof File ? value : `/blobs/revisions/${value}`}
                              title="Revision File Preview"
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
              {isCreating ? (
                <>
                  <input type="hidden" name="version" value={defaultVersion} />
                  <input type="hidden" name="startStage" value={defaultStartStage} />
                  <input type="hidden" name="currentStage" value={defaultCurrentStage} />
                  <input type="hidden" name="isFrozen" value="false" />
                </>
              ) : (
                <>
                  <Grid size={12}>
                    <FormControl fullWidth margin="none" disabled={isPending}>
                      <FormLabel component="label" htmlFor="version" error={!!errors.version}>
                        Version
                      </FormLabel>
                      <Controller
                        name="version"
                        control={control}
                        defaultValue={1}
                        render={({ field }) => (
                          <Select
                            {...field}
                            labelId="version-label"
                            label="Version"
                            error={!!errors.version}
                          >
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((v) => (
                              <MenuItem key={v} value={v}>
                                Version {v}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <FormHelperText error={!!errors.version}>
                        {errors.version?.message || state?.errors?.version?.join(', ')}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth margin="none" disabled={isPending}>
                      <InputLabel id="startStage-label">Start Stage</InputLabel>
                      <Controller
                        name="startStage"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} labelId="startStage-label" label="Start Stage">
                            {stageOptions.map((stage) => (
                              <MenuItem key={stage} value={stage}>
                                {stage}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <FormHelperText error={!!errors.startStage}>
                        {errors.startStage?.message || state?.errors?.startStage?.join(', ')}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth margin="none" disabled={isPending}>
                      <InputLabel id="currentStage-label">Current Stage</InputLabel>
                      <Controller
                        name="currentStage"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} labelId="currentStage-label" label="Current Stage">
                            {stageOptions.map((stage) => (
                              <MenuItem key={stage} value={stage}>
                                {stage}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <FormHelperText error={!!errors.currentStage}>
                        {errors.currentStage?.message || state?.errors?.currentStage?.join(', ')}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}
