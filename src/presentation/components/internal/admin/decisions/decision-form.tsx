'use client';

import {
  Box,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import { createDecisionAction, DecisionActionState } from '@app/presentation/actions';
import { useActionState, useTransition, useRef, useCallback, useMemo } from 'react';
import { IssueDto, DecisionMapper } from '@app/infrastructure/dtos';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { decisionInputSchema } from '@app/presentation/schemas';
import { DecisionToolbar } from './decision-toolbar';
import { z } from 'zod';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { Decision } from '@app/domain/entities';

type Props = {
  submissionId: string;
  revisionId: string;
  startStage: string;
  issues: IssueDto[];
  revisionVersion: number;
};

const extendedDecisionFormSchema = decisionInputSchema.extend({
  isFrozen: z.boolean(),
  issueId: z.string().optional(),
});

export type ExtendedDecisionFormInput = z.infer<typeof extendedDecisionFormSchema>;

export function DecisionForm({
  submissionId,
  revisionId,
  startStage,
  issues,
  revisionVersion,
}: Props) {
  const [state, formAction] = useActionState<DecisionActionState, FormData>(
    createDecisionAction,
    null,
  );
  const [isPending, startTransition] = useTransition();

  const methods = useForm<ExtendedDecisionFormInput>({
    resolver: zodResolver(extendedDecisionFormSchema),
    defaultValues: {
      submissionId,
      revisionId,
      deciderId: '00000000-0000-7000-8000-000000000000', // Placeholder
      startStage: startStage as Decision['startStage'],
      decidedStage: startStage as Decision['decidedStage'],
      comment: '',
      isFrozen: false,
      issueId: '',
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = methods;

  // eslint-disable-next-line react-hooks/incompatible-library
  const decidedStage = watch('decidedStage');
  const ref = useRef<HTMLFormElement>(null);

  const handleFormAction = useMemo(
    () => (formData: FormData) => {
      startTransition(() => {
        formAction(formData);
      });
    },
    [formAction, startTransition],
  );

  const onSubmit = useCallback(
    (data: ExtendedDecisionFormInput) => {
      if (isDirty) {
        const formData = DecisionMapper.fromDomainToFormData({
          submissionId,
          revisionId,
          startStage: startStage as Decision['startStage'],
          decidedStage: data.decidedStage as Decision['decidedStage'],
          comment: data.comment,
        });

        formData.append('isFrozen', data.isFrozen ? 'true' : 'false');
        if (data.decidedStage === 'PUBLISHED' && data.issueId) {
          formData.append('issueId', data.issueId);
        }
        handleFormAction(formData);
      }
    },
    [isDirty, submissionId, revisionId, startStage, handleFormAction],
  );

  return (
    <>
      <SectionHeader title={`Create Decision for Revision v${revisionVersion}`}>
        <DecisionToolbar ref={ref} methods={methods} isPending={isPending} />
      </SectionHeader>
      <Box component="section" className="mb-4 w-full px-6">
        <Container maxWidth={false} className="max-w-2xl p-0">
          <Box component="form" ref={ref} onSubmit={handleSubmit(onSubmit)} noValidate>
            {state?.errors?.message && (
              <FormHelperText error className="mb-4">
                {state.errors.message.join(', ')}
              </FormHelperText>
            )}
            <Grid container spacing={3}>
              <Grid size={12}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.decidedStage || !!state?.errors?.decidedStage}
                  disabled={isPending}
                >
                  <InputLabel id="decidedStage-label">Decided Stage</InputLabel>
                  <Controller
                    name="decidedStage"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="decidedStage-label" label="Decided Stage">
                        <MenuItem value="SUBMITTED">Submitted</MenuItem>
                        <MenuItem value="REVIEW">Review</MenuItem>
                        <MenuItem value="EDIT">Edit</MenuItem>
                        <MenuItem value="COPY_EDIT">Copy Edit</MenuItem>
                        <MenuItem value="LAYOUT_EDIT">Layout Edit</MenuItem>
                        <MenuItem value="FINAL_REVIEW">Final Review</MenuItem>
                        <MenuItem value="PUBLISHED">Published</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                        <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    {errors.decidedStage?.message || state?.errors?.decidedStage?.join(', ')}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {decidedStage === 'PUBLISHED' && (
                <Grid size={12}>
                  <FormControl
                    fullWidth
                    required
                    error={!!errors.issueId || !!state?.errors?.issueId}
                    disabled={isPending}
                  >
                    <InputLabel id="issueId-label">Select Issue</InputLabel>
                    <Controller
                      name="issueId"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} labelId="issueId-label" label="Select Issue">
                          {issues.map((issue) => (
                            <MenuItem key={issue.id} value={issue.id}>
                              Vol. {issue.volume} No. {issue.number}{' '}
                              {issue.title ? `- ${issue.title}` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    <FormHelperText>
                      {errors.issueId?.message || state?.errors?.issueId?.join(', ')}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              )}

              <Grid size={12}>
                <Controller
                  name="comment"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Comment"
                      multiline
                      rows={4}
                      error={!!errors.comment || !!state?.errors?.comment}
                      helperText={errors.comment?.message || state?.errors?.comment?.join(', ')}
                      disabled={isPending}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <FormControl
                  component="fieldset"
                  disabled={isPending}
                  error={!!errors.isFrozen || !!state?.errors?.isFrozen}
                >
                  <FormLabel component="legend">
                    Require new revision and freeze current revision? (This cannot be undone)
                  </FormLabel>
                  <Controller
                    name="isFrozen"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <RadioGroup
                        row
                        value={value ? 'yes' : 'no'}
                        onChange={(e) => onChange(e.target.value === 'yes')}
                      >
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                      </RadioGroup>
                    )}
                  />
                  <FormHelperText>
                    {errors.isFrozen?.message || state?.errors?.isFrozen?.join(', ')}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
}
