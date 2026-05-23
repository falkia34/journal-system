import { PathMenu, UrlMenu, NestedMenu } from '@app/domain/entities';

export * from './symbols';
export * from './themes';
export * from './fonts';

export const APP: {
  site: {
    url: string;
    title: string;
    tagline: string;
    description: string;
    image: string;
    locale: string;
  };
  admin: {
    nav: {
      menus: Required<
        PathMenu | UrlMenu | NestedMenu<Omit<PathMenu, 'icon'> | Omit<UrlMenu, 'icon'>>
      >[];
    };
    sidebar: {
      menus: RequiredBy<PathMenu | NestedMenu<RequiredBy<PathMenu, 'icon'>>, 'icon'>[];
    };
  };
  editor: {
    nav: {
      menus: Required<
        PathMenu | UrlMenu | NestedMenu<Omit<PathMenu, 'icon'> | Omit<UrlMenu, 'icon'>>
      >[];
    };
    sidebar: {
      menus: RequiredBy<PathMenu | NestedMenu<RequiredBy<PathMenu, 'icon'>>, 'icon'>[];
    };
  };
  reviewer: {
    nav: {
      menus: Required<
        PathMenu | UrlMenu | NestedMenu<Omit<PathMenu, 'icon'> | Omit<UrlMenu, 'icon'>>
      >[];
    };
    sidebar: {
      menus: RequiredBy<PathMenu | NestedMenu<RequiredBy<PathMenu, 'icon'>>, 'icon'>[];
    };
  };
  author: {
    nav: {
      menus: Required<
        PathMenu | UrlMenu | NestedMenu<Omit<PathMenu, 'icon'> | Omit<UrlMenu, 'icon'>>
      >[];
    };
    sidebar: {
      menus: RequiredBy<PathMenu | NestedMenu<RequiredBy<PathMenu, 'icon'>>, 'icon'>[];
    };
  };
} = {
  site: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Journal System',
    tagline:
      'An open journal systems platform for article submission, peer review, and publication',
    description:
      'A modern journal management system for seamless article submission and peer review.',
    image: '/images/logo.png',
    locale: 'en-US',
  },
  admin: {
    nav: {
      menus: [],
    },
    sidebar: {
      menus: [
        { name: 'Journals', icon: 'menu-book', path: '/journals' },
        { name: 'Issues', icon: 'calendar-month', path: '/issues' },
        {
          name: 'Submissions',
          icon: 'assignment',
          path: '/submissions',
          matcher: '^/submissions',
        },
        { name: 'Users', icon: 'people', path: '/users' },
        {
          name: 'Settings',
          icon: 'settings',
          path: '/settings',
          matcher: '^/settings',
        },
      ],
    },
  },
  editor: {
    nav: {
      menus: [],
    },
    sidebar: {
      menus: [
        {
          name: 'Submissions',
          icon: 'rate-review',
          path: '/submissions',
          matcher: '^/submissions',
        },
        {
          name: 'Settings',
          icon: 'settings',
          path: '/settings',
          matcher: '^/settings',
        },
      ],
    },
  },
  reviewer: {
    nav: {
      menus: [],
    },
    sidebar: {
      menus: [
        {
          name: 'Submissions',
          icon: 'assignment-turned-in',
          path: '/submissions',
          matcher: '^/submissions',
        },
        {
          name: 'Settings',
          icon: 'settings',
          path: '/settings',
          matcher: '^/settings',
        },
      ],
    },
  },
  author: {
    nav: {
      menus: [],
    },
    sidebar: {
      menus: [
        {
          name: 'Submissions',
          icon: 'drive-file-rename-outline',
          path: '/submissions',
          matcher: '^/submissions',
        },
        {
          name: 'Settings',
          icon: 'settings',
          path: '/settings',
          matcher: '^/settings',
        },
      ],
    },
  },
};
