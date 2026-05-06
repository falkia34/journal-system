import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { User } from '@app/domain/entities';

export type UserRecord = Prisma.UserGetPayload<object>;

export interface UserDto {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: ('Author' | 'Reviewer' | 'Editor' | 'Administrator')[];
  created_at: string;
  updated_at: string;
}

export class UserMapper {
  public static fromPrismaToDomain(payload: UserRecord): User {
    return new User(
      payload.id,
      payload.name,
      payload.email,
      payload.password,
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
      password: user.password,
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
      dto.password,
      dto.roles,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
    );
  }
}
