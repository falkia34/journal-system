import type { AuthServerDataSource } from '@app/infrastructure/datasources/server';
import type { AuthClientDataSource } from '@app/infrastructure/datasources/client';
import { AuthRepository } from '@app/domain/repositories';
import { Either, left, right } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { NextRequest } from 'next/server';
import { Session } from '@app/domain/entities';
import { SYMBOLS } from '@config';

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  private isServer = typeof window === 'undefined';

  public constructor(
    @inject(SYMBOLS.AuthDataSource)
    private authDataSource: AuthServerDataSource | AuthClientDataSource,
  ) {}

  public async signIn(callbackUrl?: string): Promise<Either<void, Error>> {
    try {
      if (this.isServer) {
        return left(new Error('Sign-in is not supported on the server side'));
      } else {
        await (this.authDataSource as AuthClientDataSource).signIn.social({
          provider: 'google',
          callbackURL: callbackUrl,
        });
      }

      return right(undefined);
    } catch (error) {
      return left(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async signOut(request?: Request): Promise<Either<void, Error>> {
    try {
      if (this.isServer) {
        let headers: HeadersInit;

        if (request) {
          headers = new NextRequest(request).headers;
        } else {
          const { headers: headersFunc } = await import('next/headers.js');
          headers = await headersFunc();
        }
        await (this.authDataSource as AuthServerDataSource).api.signOut({
          headers,
        });
      } else {
        await (this.authDataSource as AuthClientDataSource).signOut();
      }

      return right(undefined);
    } catch (error) {
      return left(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async getSession(request?: Request): Promise<Either<Session, Error>> {
    try {
      let session;

      if (this.isServer) {
        let headers: HeadersInit;

        if (request) {
          headers = new NextRequest(request).headers;
        } else {
          const { headers: headersFunc } = await import('next/headers.js');
          headers = await headersFunc();
        }

        session = await (this.authDataSource as AuthServerDataSource).api.getSession({
          headers,
        });
      } else {
        const { data, error } = await (this.authDataSource as AuthClientDataSource).getSession();
        session = data;
        if (error) {
          return left(new Error(error.message));
        }
      }

      if (!session) {
        return left(new Error('Session not found'));
      }

      return right(
        new Session(
          {
            id: session.user.internalId || '',
            name: session.user.name || '',
            emailAddress: session.user.email || '',
            imageUrl: session.user.image || null,
          },
          (session.user.roles || []) as ('AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMINISTRATOR')[],
          session.user.activeRole as 'AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMINISTRATOR',
        ),
      );
    } catch (error) {
      return left(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async updateSession(session: Session): Promise<Either<Session, Error>> {
    try {
      if (this.isServer) {
        return left(new Error('Session update is not supported on the server side'));
      } else {
        const { data, error } = await (this.authDataSource as AuthClientDataSource).updateUser({
          roles: session.roles,
          activeRole: session.activeRole,
        });
        if (error) {
          return left(new Error(error.message));
        }
        if (!data) {
          return left(new Error('Failed to update session'));
        }
        return right(session);
      }
    } catch (error) {
      return left(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
