import { GetUsers, GetSession } from '@app/application';
import { match } from 'effect/Either';
import {
  UserDto,
  UserMapper,
  PaginationOptionsDto,
  PaginationOptionsMapper,
} from '@app/infrastructure/dtos';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { UsersList, UsersToolbar } from '@app/presentation/components/internal/admin/users';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
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

  const getUsers = serverContainer.get<GetUsers>(SYMBOLS.GetUsers);
  const result = await getUsers.execute(undefined, undefined, { take: 25 });
  const [users, paginationOptions] = match(result, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  return (
    <>
      <SectionHeader title="Users">
        <UsersToolbar />
      </SectionHeader>
      <UsersList
        initialUsers={users.map(UserMapper.fromDomainToDto) as UserDto[]}
        initialPaginationOptions={
          PaginationOptionsMapper.fromDomainToDto(paginationOptions) as PaginationOptionsDto
        }
      />
    </>
  );
}
