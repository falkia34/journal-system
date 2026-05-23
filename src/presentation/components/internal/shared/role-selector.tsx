'use client';

import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useInternalStore } from '@app/presentation/hooks';
import { useShallow } from 'zustand/shallow';
import { useRouter } from 'next/navigation';

export function RoleSelector() {
  const router = useRouter();
  const [session, setActiveRole] = useInternalStore(
    useShallow((s) => [s.session, s.setActiveRole]),
  );

  const roles = session?.roles ?? [];
  const activeRole = session?.activeRole;

  const handleChange = async (event: SelectChangeEvent) => {
    const newRole = event.target.value;
    if (newRole && newRole !== activeRole) {
      await setActiveRole(newRole as (typeof roles)[number]);
      router.push('/');
    }
  };

  return (
    <Select
      value={activeRole ?? ''}
      onChange={handleChange}
      disabled={roles.length <= 1}
      variant="outlined"
      size="small"
      fullWidth
      className="mt-2"
      sx={{
        '& .MuiSelect-icon': {
          display: roles.length <= 1 ? 'none' : 'inline-block',
        },
      }}
      slotProps={{
        input: {
          id: 'role-selector',
        },
      }}
    >
      {roles.map((role) => (
        <MenuItem key={role} value={role}>
          {role
            .toLowerCase()
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')}
        </MenuItem>
      ))}
    </Select>
  );
}
