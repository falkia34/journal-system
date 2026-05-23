import { GetSession, GetUser } from '@app/application';
import { match } from 'effect/Either';
import { ProfileForm } from '@app/presentation/components/internal/shared/profile';
import { UserDto, UserMapper } from '@app/infrastructure/dtos';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';

export default async function ProfileEditPage() {
  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const getUser = serverContainer.get<GetUser>(SYMBOLS.GetUser);
  const userResult = await getUser.execute(session.user.id);
  const user = match(userResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return <ProfileForm initialUser={UserMapper.fromDomainToDto(user) as UserDto} />;
}
