import { GetUser, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { UserDto, UserMapper } from '@app/infrastructure/dtos';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { UserForm } from '@app/presentation/components/internal/admin/users';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function EditUserPage({ params }: Props) {
  const { userId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  if (session.activeRole !== 'ADMINISTRATOR') {
    notFound();
  }

  const getUser = serverContainer.get<GetUser>(SYMBOLS.GetUser);
  const userResult = await getUser.execute(userId);
  const user = match(userResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return <UserForm initialUser={UserMapper.fromDomainToDto(user) as UserDto} />;
}
