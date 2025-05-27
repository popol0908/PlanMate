import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Home as HomeIcon,
  EventNote as PlansIcon,
  Assessment as ProgressIcon,
  Info as AboutIcon,
  Person as ProfileIcon
} from '@mui/icons-material';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/plans')) return 1;
    if (path.startsWith('/progress')) return 2;
    if (path.startsWith('/about')) return 3;
    if (path.startsWith('/profile')) return 4;
    return 0;
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={getActiveTab()}
        onChange={(event, newValue) => {
          const routes = ['/', '/plans', '/progress', '/about', '/profile'];
          navigate(routes[newValue]);
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Plans" icon={<PlansIcon />} />
        <BottomNavigationAction label="Progress" icon={<ProgressIcon />} />
        <BottomNavigationAction label="About" icon={<AboutIcon />} />
        <BottomNavigationAction label="Profile" icon={<ProfileIcon />} />
      </BottomNavigation>
    </Paper>
  );
}