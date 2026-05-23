import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { User } from '@app/domain/entities';

export type UserRecord = Prisma.UserGetPayload<object>;

export interface UserDto {
  id: string;
  name: string;
  email: string;
  roles: ('AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMINISTRATOR')[];
  created_at: string;
  updated_at: string;
}

export class UserMapper {
  public static fromPrismaToDomain(payload: UserRecord): User {
    return new User(
      payload.id,
      payload.name,
      payload.email,
      payload.roles,
      payload.createdAt,
      payload.updatedAt,
    );
  }

  public static fromDomainToDto(user: Partial<User>): Partial<UserDto> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      created_at: user.createdAt?.toISOString(),
      updated_at: user.updatedAt?.toISOString(),
    };
  }

  public static fromDtoToDomain(dto: UserDto): User {
    return new User(
      dto.id,
      dto.name,
      dto.email,
      dto.roles,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
    );
  }

  public static fromDomainToFormData(user: Partial<User>): FormData {
    const formData = new FormData();
    if (user.id) formData.append('id', user.id);
    if (user.name) formData.append('name', user.name);
    if (user.email) formData.append('email', user.email);
    if (user.roles) formData.append('roles', JSON.stringify(user.roles));
    if (user.createdAt) formData.append('createdAt', user.createdAt.toISOString());
    if (user.updatedAt) formData.append('updatedAt', user.updatedAt.toISOString());
    return formData;
  }

  public static fromFormDataToDomain(formData: FormData): User {
    return new User(
      formData.get('id') as string,
      formData.get('name') as string,
      formData.get('email') as string,
      JSON.parse(formData.get('roles') as string) as (
        | 'AUTHOR'
        | 'REVIEWER'
        | 'EDITOR'
        | 'ADMINISTRATOR'
      )[],
      formData.get('createdAt')
        ? DateTime.fromISO(formData.get('createdAt') as string).toJSDate()
        : new Date(),
      formData.get('updatedAt')
        ? DateTime.fromISO(formData.get('updatedAt') as string).toJSDate()
        : new Date(),
    );
  }
}
