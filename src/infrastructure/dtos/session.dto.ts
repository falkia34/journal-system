import { Session } from '@app/domain/entities';

export interface SessionDto {
  user: {
    id: string;
    name: string;
    email_address: string;
    image_url: string | null;
  };
  roles: ('AUTHOR' | 'EDITOR' | 'REVIEWER' | 'ADMINISTRATOR')[];
  active_role: 'AUTHOR' | 'EDITOR' | 'REVIEWER' | 'ADMINISTRATOR';
}

export class SessionMapper {
  public static fromDomainToDto(session: Partial<Session>): Partial<SessionDto> {
    return {
      user: session.user
        ? {
            id: session.user.id,
            name: session.user.name,
            email_address: session.user.emailAddress,
            image_url: session.user.imageUrl,
          }
        : undefined,
      roles: session.roles,
      active_role: session.activeRole,
    };
  }

  public static fromDtoToDomain(dto: SessionDto): Session {
    return new Session(
      {
        id: dto.user.id,
        name: dto.user.name,
        emailAddress: dto.user.email_address,
        imageUrl: dto.user.image_url,
      },
      dto.roles,
      dto.active_role,
    );
  }
}
