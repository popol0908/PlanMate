import React from 'react';
import { Box, Typography } from '@mui/material';

const PageTitle = ({ title, subtitle, icon, sx = {} }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4, 
        flexWrap: 'wrap', 
        gap: 3,
        ...sx 
      }}
    >
      {icon && (
        <Box 
          component="img"
          src={icon} 
          alt=""
          sx={{ 
            width: 60, 
            height: 60,
            objectFit: 'contain',
            flexShrink: 0
          }}
        />
      )}
      <Box sx={{ flex: 1, minWidth: 300 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{
              fontSize: '1.1rem',
              maxWidth: '600px'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PageTitle;
