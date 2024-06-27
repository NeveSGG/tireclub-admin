import React, { FC } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ErrorPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h2">404</Typography>
      <Typography variant="h4">Данной страницы не существует</Typography>
      <Button onClick={() => navigate('/')} sx={{ marginTop: '30px' }}>
        На Главную
      </Button>
    </Box>
  );
};

export default ErrorPage;
