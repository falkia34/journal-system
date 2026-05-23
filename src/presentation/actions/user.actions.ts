'use server';

import { CreateUser, UpdateUser, DeleteUser, GetUsers } from '@app/application';
import { userInputSchema } from '@app/presentation/schemas';
import { profileInputSchema } from '@app/presentation/schemas';
import { match } from 'effect/Either';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { z } from 'zod';
import { UserDto, UserMapper, PaginationOptionsMapper } from '@app/infrastructure/dtos';
import { User, UserFilterOptions } from '@app/domain/entities';

export type UserActionState = { errors?: Record<string, string[] | undefined> } | null;

export async function createUserAction(prevState: UserActionState, formData: FormData) {
  const raw = UserMapper.fromFormDataToDomain(formData);
  const parsed = userInputSchema.safeParse(raw);

  if (parsed.success) {
    const createUser = serverContainer.get<CreateUser>(SYMBOLS.CreateUser);
    const result = await createUser.execute({
      ...parsed.data,
      roles: parsed.data.roles as User['roles'],
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('users', 'max');

        redirect('/users');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        name: errors?.name?.errors,
        email: errors?.email?.errors,
        roles: errors?.roles?.errors,
      },
    };
  }
}

export async function updateUserAction(prevState: UserActionState, formData: FormData) {
  const raw = UserMapper.fromFormDataToDomain(formData);
  const parsed = userInputSchema.safeParse(raw);

  if (parsed.success) {
    const updateUser = serverContainer.get<UpdateUser>(SYMBOLS.UpdateUser);
    const id = raw.id as string;
    const result = await updateUser.execute(id, {
      ...parsed.data,
      roles: parsed.data.roles as User['roles'],
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('users', 'max');
        redirect('/users');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        name: errors?.name?.errors,
        email: errors?.email?.errors,
        roles: errors?.roles?.errors,
      },
    };
  }
}

export async function updateProfileAction(prevState: UserActionState, formData: FormData) {
  const raw = UserMapper.fromFormDataToDomain(formData);
  const parsed = profileInputSchema.safeParse(raw);

  if (parsed.success) {
    const updateUser = serverContainer.get<UpdateUser>(SYMBOLS.UpdateUser);
    const id = raw.id as string;
    const result = await updateUser.execute(id, {
      name: parsed.data.name,
      email: parsed.data.email,
      roles: (raw.roles as User['roles']) ?? [],
    });

    return match(result, {
      onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
      onRight: () => {
        revalidateTag('users', 'max');
        redirect('/settings/profile');
      },
    });
  } else {
    const errors = z.treeifyError(parsed.error).properties;

    return {
      errors: {
        name: errors?.name?.errors,
        email: errors?.email?.errors,
      },
    };
  }
}

export async function deleteUserAction(id: string) {
  const deleteUser = serverContainer.get<DeleteUser>(SYMBOLS.DeleteUser);
  const result = await deleteUser.execute(id);

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: () => {
      revalidateTag('users', 'max');
      return null;
    },
  });
}

export async function getUsersAction(
  filters?: UserFilterOptions,
  cursor?: string,
  perPage?: number,
) {
  const getUsers = serverContainer.get<GetUsers>(SYMBOLS.GetUsers);
  const result = await getUsers.execute(filters, undefined, {
    cursor: cursor,
    take: perPage ?? 25,
  });

  return match(result, {
    onLeft: (error) => ({ errors: { message: [(error as Error).message] } }),
    onRight: ([users, paginationOptions]) => ({
      users: users.map(UserMapper.fromDomainToDto) as UserDto[],
      paginationOptions: PaginationOptionsMapper.fromDomainToDto(paginationOptions),
    }),
  });
}
