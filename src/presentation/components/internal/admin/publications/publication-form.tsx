'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Container, Grid } from '@mui/material';
import { PublicationDto, PublicationMapper } from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { updatePublicationAction, PublicationActionState } from '@app/presentation/actions';
import { useActionState } from 'react';
import { PublicationInput, publicationInputSchema } from '@app/presentation/schemas';
import { PublicationToolbar } from './publication-toolbar';

type Props = {
  initialPublication: PublicationDto;
};

export function PublicationForm({ initialPublication }: Props) {
  const [, formAction] = useActionState<PublicationActionState, FormData>(
    updatePublicationAction,
    null,
  );

  const publication = useMemo(
    () => PublicationMapper.fromDtoToDomain(initialPublication),
    [initialPublication],
  );
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<PublicationInput>({
    resolver: zodResolver(publicationInputSchema) as Resolver<PublicationInput>,
    defaultValues: {
      publishedAt: publication.publishedAt,
    },
  });

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const handleFormAction = useMemo(
    () => (formData: FormData) => {
      formAction(formData);
    },
    [formAction],
  );

  const onSubmit = useCallback(
    (data: Parameters<Parameters<typeof handleSubmit>[0]>[0]) => {
      if (isDirty) {
        const formData = PublicationMapper.fromDomainToFormData({
          id: publication.id,
          ...data,
        });

        handleFormAction(formData);
      }
    },
    [isDirty, publication.id, handleFormAction],
  );

  return (
    <>
      <SectionHeader title="Edit Publication">
        <PublicationToolbar ref={ref} methods={methods} />
      </SectionHeader>
      <Box component="form" ref={ref} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Box component="section" className="mb-4 w-full px-6">
          <Container maxWidth={false} className="max-w-2xl p-0">
            <Grid container spacing={2}></Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}
