import { ReactNode } from 'react';
import { Toolbar, Typography } from '@mui/material';

type Props = {
  title: string;
  badge?: ReactNode;
  children?: ReactNode;
};

export function SectionHeader({ title, badge, children }: Props) {
  return (
    <Toolbar component="header" className="items-start p-6">
      <Typography
        component="h1"
        variant="h5"
        className={`${children || badge ? 'mr-4' : ''} font-medium`}
      >
        {title}
      </Typography>
      {badge}
      {children}
    </Toolbar>
  );
}
