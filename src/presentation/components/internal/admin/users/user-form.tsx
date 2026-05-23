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
import { UserDto, UserMapper } from '@app/infrastructure/dtos';
import { User } from '@app/domain/entities';
import { createUserAction, updateUserAction, UserActionState } from '@app/presentation/actions';
import { useActionState, useTransition } from 'react';
import { UserToolbar } from './user-toolbar';
import { UserInput, userInputSchema } from '@app/presentation/schemas';
import { SectionHeader } from '@app/presentation/components/internal/shared';

const ROLES = ['AUTHOR', 'REVIEWER', 'EDITOR', 'ADMINISTRATOR'] as const;

type Props = {
  initialUser?: UserDto;
};

export function UserForm({ initialUser }: Props) {
  const [state, formAction] = useActionState<UserActionState, FormData>(
    initialUser ? updateUserAction : createUserAction,
    null,
  );
  const [isPending, startTransition] = useTransition();

  const user = useMemo(
    () => (initialUser ? UserMapper.fromDtoToDomain(initialUser) : null),
    [initialUser],
  );
  const ref = useRef<HTMLFormElement>(null);
  const methods = useForm<UserInput>({
    resolver: zodResolver(userInputSchema) as Resolver<UserInput>,
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          roles: user.roles,
        }
      : {
          name: '',
          email: '',
          roles: [],
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
        const formData = UserMapper.fromDomainToFormData({
          id: user?.id,
          ...data,
          roles: data.roles as User['roles'],
        });

        handleFormAction(formData);
      }
    },
    [isDirty, user?.id, handleFormAction],
  );

  return (
    <>
      <SectionHeader title={user ? user.name : 'Create User'}>
        <UserToolbar ref={ref} methods={methods} />
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
              <Grid size={12}>
                <FormControl
                  fullWidth
                  margin="none"
                  disabled={isPending}
                  error={!!errors.roles || !!state?.errors?.roles}
                >
                  <InputLabel id="roles-label">Roles</InputLabel>
                  <Controller
                    name="roles"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <Select {...field} labelId="roles-label" label="Roles" multiple>
                        {ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role
                              .toLowerCase()
                              .split('_')
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    {errors.roles?.message ||
                      state?.errors?.roles?.join(', ') ||
                      'At least one role is required'}
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
