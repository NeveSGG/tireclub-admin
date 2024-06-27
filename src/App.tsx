import React, { FC, useEffect } from 'react';

import { RouteObject, useRoutes } from 'react-router-dom';
import { observer } from 'mobx-react';

import { Sanctum } from 'react-sanctum';
import CustomizedOutlet from 'components/customizedOutlet';
import Notification from 'components/notification';

import Listing from 'routes/listing';
import Item from 'routes/item';
import ErrorPage from 'routes/404';

import environment from 'config/environments/environment';

import introspectionStore from 'store/IntrospectionStore';

import './app.scss';
import Authorization from 'routes/authorization';
import instance, { webInstance } from 'api/utilities/axios';
import cookies from 'cookies';

const sanctumConfig = {
  apiUrl: environment.serverBaseUrl,
  csrfCookieRoute: 'sanctum/csrf-cookie',
  signInRoute: 'login',
  signOutRoute: 'logout',
  userObjectRoute: 'user',
  axiosInstance: instance
};

const token = cookies.get('token');

const App: FC = () => {
  const { introspectionRoutes } = introspectionStore;

  useEffect(() => {
    console.log('token ', token);
    webInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [token]);

  useEffect(() => {
    document.title = environment.siteTitle ?? 'Админ-панель';
  }, []);

  useEffect(() => {
    introspectionStore.introspectRoutes().then((val) => {
      if (val.isOk) {
        val.data.forEach(async (route) => {
          if (route.in_admin) {
            await introspectionStore.introspect(route.url.slice(1));
          }
        });
      }
    });
  }, []);

  const routes: RouteObject[] = [
    {
      path: '/',
      element: <CustomizedOutlet />,
      children: [
        ...introspectionRoutes.map((el) => ({
          path: el.url,
          element: <Listing route={el.url} name={el.name} />
        })),
        ...introspectionRoutes.map((el) => ({
          path: `${el.url}/:uuid`,
          element: <Item route={el.url} />
        })),
        {
          path: '*',
          element: <ErrorPage />,
          children: []
        }
      ]
    },
    {
      path: 'signUp',
      element: <Authorization type="signUp" />,
      children: []
    },
    {
      path: 'signIn',
      element: <Authorization type="signIn" />,
      children: []
    }
  ];

  const element = useRoutes(routes);

  return (
    <>
      <Sanctum config={sanctumConfig}>{element}</Sanctum>
      <Notification />
    </>
  );
};

export default observer(App);
