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
  TextField,
} from '@mui/material';
import { createDecisionAction, DecisionActionState } from '@app/presentation/actions';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { useActionState, useTransition } from 'react';
import { DecisionInput, decisionInputSchema } from '@app/presentation/schemas';
import { DecisionToolbar } from './decision-toolbar';
import { DecisionMapper } from '@app/infrastructure/dtos';
import { Decision } from '@app/domain/entities';

type Props = {
  submissionId: string;
  revisionId: string;
  startStage: string;
};

export function DecisionForm({ submissionId, revisionId, startStage }: Props) {
  const [state, formAction] = useActionState<DecisionActionState, FormData>(
    createDecisionAction,
    null,
  );
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<DecisionInput>({
    resolver: zodResolver(decisionInputSchema) as Resolver<DecisionInput>,
    defaultValues: {
      submissionId,
      revisionId,
      startStage,
      decidedStage: '',
      comment: '',
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
        const formData = DecisionMapper.fromDomainToFormData({
          ...data,
          startStage: data.startStage as Decision['startStage'],
          decidedStage: data.decidedStage as Decision['decidedStage'],
        });

        handleFormAction(formData);
      }
    },
    [isDirty, handleFormAction],
  );

  return (
    <>
      <SectionHeader title="Create Decision">
        <DecisionToolbar ref={ref} methods={methods} />
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
                  error={!!errors.decidedStage || !!state?.errors?.decidedStage}
                >
                  <InputLabel id="decidedStage-label">Decided Stage</InputLabel>
                  <Controller
                    name="decidedStage"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select {...field} labelId="decidedStage-label" label="Decided Stage">
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
                    {errors.decidedStage?.message || state?.errors?.decidedStage?.join(', ')}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  {...register('comment')}
                  label="Comment"
                  fullWidth
                  margin="none"
                  multiline
                  rows={3}
                  error={!!errors.comment || !!state?.errors?.comment}
                  helperText={errors.comment?.message || state?.errors?.comment?.join(', ')}
                  disabled={isPending}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}

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
