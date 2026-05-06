import { DateTime } from 'luxon';
import { Session } from '@app/domain/entities';

export interface SessionDto {
  user: {
    id: string;
    name: string;
    email_address: string;
  };
  roles: ('Author' | 'Editor' | 'Reviewer' | 'Administrator')[];
  expires_at: string;
}

export class SessionMapper {
  public static fromDomainToDto(session: Partial<Session>): Partial<SessionDto> {
    return {
      user: session.user
        ? {
            id: session.user.id,
            name: session.user.name,
            email_address: session.user.emailAddress,
          }
        : undefined,
      roles: session.roles,
      expires_at: session.expiresAt?.toISOString(),
    };
  }

  public static fromDtoToDomain(dto: SessionDto): Session {
    return new Session(
      {
        id: dto.user.id,
        name: dto.user.name,
        emailAddress: dto.user.email_address,
      },
      dto.roles,
      DateTime.fromISO(dto.expires_at).toJSDate(),
    );
  }
}
