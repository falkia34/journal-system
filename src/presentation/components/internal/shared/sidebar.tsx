'use client';

import {
  KeyboardDoubleArrowLeftRounded,
  KeyboardDoubleArrowRightRounded,
} from '@mui/icons-material';
import {
  Backdrop,
  Box,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { NestedMenu, PathMenu } from '@app/domain/entities';
import { InternalStoreContext } from './store-provider';
import { SidebarDropdownMenu } from './sidebar-dropdown-menu';
import { SidebarMenu } from './sidebar-menu';
import { useInternalStore } from '@app/presentation/hooks';
import { useContext, useMemo, useSyncExternalStore } from 'react';
import { useShallow } from 'zustand/shallow';
import { APP } from '@config';

export function InternalSidebar() {
  const store = useContext(InternalStoreContext);
  const sidebarExtended = useSyncExternalStore(
    store!.subscribe,
    () => store?.getState().sidebarExtended,
    () => true,
  );
  const [
    activeRole,
    sidebarOpened,
    sidebarHovered,
    setSidebarOpenedState,
    setSidebarExtendedState,
    setSidebarHoveredState,
  ] = useInternalStore(
    useShallow((s) => [
      s.session?.activeRole,
      s.sidebarOpened,
      s.sidebarHovered,
      s.setSidebarOpenedState,
      s.setSidebarExtendedState,
      s.setSidebarHoveredState,
    ]),
  );
  const menus = useMemo(() => {
    let result: RequiredBy<PathMenu | NestedMenu<RequiredBy<PathMenu, 'icon'>>, 'icon'>[];

    switch (activeRole) {
      case 'ADMINISTRATOR':
        result = APP.admin.sidebar.menus;
        break;
      case 'EDITOR':
        result = APP.editor.sidebar.menus;
        break;
      case 'REVIEWER':
        result = APP.reviewer.sidebar.menus;
        break;
      case 'AUTHOR':
        result = APP.author.sidebar.menus;
        break;
      default:
        result = [];
    }
    return result;
  }, [activeRole]);

  const handleBackdrop = () => setSidebarOpenedState(false);
  const handleExtend = () => setSidebarExtendedState(!sidebarExtended);
  const handleMouseEnter = () => {
    if (!sidebarExtended) {
      setSidebarHoveredState(true);
    }
  };
  const handleMouseLeave = () => {
    if (!sidebarExtended) {
      setSidebarHoveredState(false);
    }
  };

  return (
    <>
      <Backdrop open={sidebarOpened} onClick={handleBackdrop} className="z-500 lg:hidden" />
      <Container
        component="aside"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          bgcolor: 'surfaceContainer.main',
        }}
        className={`no-scrollbar fixed top-0 bottom-0 left-0 z-550 flex w-65 max-w-full flex-col overflow-x-auto px-0 pt-18.5 transition-all lg:translate-x-0 ${
          sidebarOpened ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarExtended || sidebarHovered ? '' : 'lg:w-20! lg:overflow-y-hidden'}`}
      >
        <Box className="flex min-h-full flex-col justify-between">
          <List>
            {menus.map((menu, i) =>
              'items' in menu ? (
                <SidebarDropdownMenu key={i} menu={menu as NestedMenu<PathMenu>} />
              ) : (
                <SidebarMenu key={i} menu={menu as PathMenu} />
              ),
            )}
          </List>

          <Container
            component="footer"
            sx={{
              bgcolor: 'surfaceContainer.main',
            }}
            className="sticky bottom-0 z-11 hidden px-0 lg:block"
          >
            <List>
              <ListItem>
                <ListItemButton onClick={handleExtend}>
                  <ListItemIcon>
                    {sidebarExtended ? (
                      <KeyboardDoubleArrowLeftRounded className="align-text-bottom" />
                    ) : (
                      <KeyboardDoubleArrowRightRounded className="align-text-bottom" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    className={`transition-all ${
                      sidebarExtended || sidebarHovered ? '' : 'opacity-0'
                    }`}
                  >
                    {sidebarExtended ? 'Collapse' : 'Expand'}
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
          </Container>
        </Box>
      </Container>
    </>
  );
}
