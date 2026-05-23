'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Container, Grid, TextField } from '@mui/material';
import { UserDto, UserMapper } from '@app/infrastructure/dtos';
import { updateProfileAction, UserActionState } from '@app/presentation/actions';
import { useActionState, useTransition } from 'react';
import { ProfileToolbar } from './profile-toolbar';
import { profileInputSchema } from '@app/presentation/schemas';
import { SectionHeader } from '@app/presentation/components/internal/shared';

type Props = {
  initialUser: UserDto;
};

export function ProfileForm({ initialUser }: Props) {
  const [state, formAction] = useActionState<UserActionState, FormData>(updateProfileAction, null);
  const [isPending, startTransition] = useTransition();

  const user = useMemo(() => UserMapper.fromDtoToDomain(initialUser), [initialUser]);
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm({
    resolver: zodResolver(profileInputSchema) as Resolver<{ name: string; email: string }>,
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const {
    handleSubmit,
    formState: { isDirty, errors },
    register,
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
    (data: { name: string; email: string }) => {
      if (isDirty) {
        const formData = UserMapper.fromDomainToFormData({
          id: user.id,
          ...data,
          roles: user.roles,
        });

        handleFormAction(formData);
      }
    },
    [isDirty, user.id, user.roles, handleFormAction],
  );

  return (
    <>
      <SectionHeader title="Edit Profile">
        <ProfileToolbar ref={ref} methods={methods} />
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
                  {...register('email')}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="none"
                  error={!!errors.email || !!state?.errors?.email}
                  helperText={errors.email?.message || state?.errors?.email?.join(', ')}
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
