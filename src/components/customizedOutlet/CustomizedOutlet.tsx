import React, { FC, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

import { useSanctum } from 'react-sanctum';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Header from 'components/header';
import Sidebar from 'components/sidebar';
import introspectionStore from 'store/IntrospectionStore';
import { observer } from 'mobx-react';
import environment from 'config/environments/environment';
import cookies from 'cookies';
import instance, { webInstance } from 'api/utilities/axios';
import notificationStore from 'store/NotificationStore';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar
}));

const CustomizedOutlet: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { introspectionRoutes } = introspectionStore;
  const { authenticated, setUser } = useSanctum();
  const { pathname } = useLocation();

  const navigate = useNavigate();

  instance.interceptors.response.use(
    (resp) => resp,
    (err) => {
      if (err.response.status === 401) {
        navigate('/signIn');
        notificationStore.info('Необходимо авторизоваться');
      }
      if (err.response.status === 403) {
        navigate('/signIn');
        notificationStore.error('Недостаточно прав');
      }
      return Promise.reject(err);
    }
  );

  webInstance.interceptors.response.use(
    (resp) => resp,
    (err) => {
      if (err.response.status === 401) {
        navigate('/signIn');
        notificationStore.info('Необходимо авторизоваться');
      }
      if (err.response.status === 403) {
        navigate('/signIn');
        notificationStore.error('Недостаточно прав');
      }
      return Promise.reject(err);
    }
  );

  useEffect(() => {
    console.log(7);
    if (
      environment.authorizationEnabled &&
      parseInt(environment.authorizationEnabled, 10)
    ) {
      if (!authenticated) {
        const token = cookies.get('token');
        if (token) {
          webInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
          instance.defaults.headers.common.Authorization = `Bearer ${token}`;
          webInstance
            .get('/user')
            .then((val) => {
              if (typeof val.data?.email === 'string') {
                setUser(val.data);
              }
            })
            .catch(() => {
              navigate('/signIn');
            });
        } else {
          navigate('/signIn');
        }
      } else {
        console.info('unauthenticated');
      }
    }
  }, [authenticated]);

  useEffect(() => {
    if (pathname === '/' && introspectionRoutes.length) {
      navigate(introspectionRoutes[0].url);
    }
  }, [pathname, introspectionRoutes]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Header open={sidebarOpen} setOpen={setSidebarOpen} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Paper
        component="main"
        square
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          p: 3,
          pl: sidebarOpen ? 40 : 3
        }}
      >
        <DrawerHeader />
        <Outlet />
      </Paper>
    </Box>
  );
};

export default observer(CustomizedOutlet);
