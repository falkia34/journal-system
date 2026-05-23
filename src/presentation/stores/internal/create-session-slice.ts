import type { InternalStates, InternalActions } from '@app/presentation/stores';
import { clientContainer } from '@app/client-injection';
import { StateCreator } from 'zustand';
import { Session } from '@app/domain/entities';
import { SYMBOLS } from '@config';
import { UpdateSession } from '@app/application';

export interface InternalSessionStates {
  session: Session | undefined;
}

export interface InternalSessionActions {
  setActiveRole: (state: 'AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMINISTRATOR') => Promise<void>;
}

type InternalSessionSlice = StateCreator<
  InternalStates & InternalActions,
  [['zustand/immer', never]],
  [],
  InternalSessionStates & InternalSessionActions
>;

export function createInternalSessionSlice(
  ...[set, get]: Parameters<InternalSessionSlice>
): ReturnType<InternalSessionSlice> {
  return {
    session: undefined,

    setActiveRole: async (role: 'AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMINISTRATOR') => {
      const updateSession = clientContainer.get<UpdateSession>(SYMBOLS.UpdateSession);
      const session = get().session;

      if (session) {
        const newSession = new Session(session.user, session.roles, role);

        await updateSession.execute(newSession);

        set({ session: newSession });
      }
    },
  };
}
