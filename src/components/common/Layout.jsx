import React from 'react';
import { Box, Container } from '@mui/material';
import BottomNav from './BottomNav';
import ChatWidget from '../chat/ChatWidget';

function Layout({ children }) {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      pb: '80px',
      overflow: 'auto'
    }}>
      <Container 
        maxWidth="md" 
        sx={{ 
          flex: '1 0 auto',
          py: 3,
          borderColor: 'divider'
        }}
      >
        {children}
      </Container>
      
      <ChatWidget />
      <BottomNav />
    </Box>
  );
}

export default Layout;