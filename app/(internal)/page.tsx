import { GetSession } from '@app/application';
import { match } from 'effect/Either';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  switch (session.activeRole) {
    case 'ADMINISTRATOR':
      redirect('/journals');
    case 'EDITOR':
      redirect('/submissions');
    case 'REVIEWER':
      redirect('/submissions');
    case 'AUTHOR':
      redirect('/submissions');
    default:
      redirect('/submissions');
  }
}
