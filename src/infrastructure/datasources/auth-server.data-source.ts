import { betterAuth, BetterAuthOptions } from 'better-auth/minimal';
import { isLeft } from 'effect/Either';
import { nextCookies } from 'better-auth/next-js';
import { GetUsers } from '@app/application';

export type AuthServerDataSource = ReturnType<typeof authServerDataSourceImpl>;

const isCIBuild = process.env.CI === 'true' || process.env.CI === '1';

const additionalOptions = {
  user: {
    additionalFields: {
      internalId: {
        type: 'string',
        input: false,
      },
      roles: {
        type: 'string[]',
        input: true,
      },
      activeRole: {
        type: 'string',
        input: true,
      },
    },
  },
} satisfies BetterAuthOptions;

export const authServerDataSourceImpl = (getUsers: GetUsers) => {
  return betterAuth({
    ...additionalOptions,
    secret: isCIBuild ? 'some-ci-default-secret-please-change' : process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    basePath: '/auth',
    session: {
      expiresIn: 3 * 60 * 60,
      updateAge: 10 * 60,
      cookieCache: {
        enabled: true,
        maxAge: 3 * 60 * 60,
      },
    },
    account: {
      storeStateStrategy: 'cookie',
      storeAccountCookie: false,
      accountLinking: {
        enabled: false,
      },
    },
    socialProviders: {
      google: {
        prompt: 'select_account',
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        getUserInfo: async (token) => {
          try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            });

            if (!response.ok) {
              return null;
            }

            const profile = await response.json();

            const usersResult = await getUsers.execute({ email: profile.email });

            if (isLeft(usersResult)) {
              return null;
            }

            const [users] = usersResult.right;

            if (users.length !== 1) {
              return null;
            }

            return {
              user: {
                id: profile.id,
                email: profile.email,
                emailVerified: profile.verified_email,
                name: profile.name,
                image: profile.picture,
                internalId: users[0].id,
                roles: users[0].roles,
                activeRole: users[0].roles[0],
              },
              data: {
                ...profile,
                internalId: users[0].id,
                roles: users[0].roles,
                activeRole: users[0].roles[0],
              },
            };
          } catch {
            return null;
          }
        },
      },
    },
    plugins: [nextCookies()],
    disabledPaths: [
      '/error',
      '/ok',
      '/sign-up/email',
      '/sign-in/email',
      '/link-social',
      '/change-password',
      '/request-password-reset',
      '/reset-password',
      '/reset-password/:token',
      '/verify-password',
      '/change-email',
      '/send-verification-email',
      '/verify-email',
      '/list-accounts',
      '/unlink-account',
      '/account-info',
      '/delete-user',
      '/delete-user/callback',
      '/list-sessions',
      '/update-session',
      '/revoke-session',
      '/revoke-sessions',
      '/revoke-other-sessions',
      '/refresh-token',
      '/get-access-token',
    ],
    onAPIError: {
      throw: false,
      errorURL: '/login',
    },
    advanced: {
      cookiePrefix: 'auth',
      database: {
        generateId: 'uuid',
      },
    },
  });
};
