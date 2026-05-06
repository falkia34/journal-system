export * from './symbols';
export * from './themes';
export * from './fonts';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export const APP = {
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
  internal: {
    nav: {
      menus: [] as NavItem[],
    },
    sidebar: {
      menus: [] as NavItem[],
    },
  },
} as const;
