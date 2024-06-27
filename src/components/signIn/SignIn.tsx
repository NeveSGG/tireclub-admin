import React, { FC, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';

import { useFormik } from 'formik';
import * as yup from 'yup';

import { useSanctum } from 'react-sanctum';

import { useNavigate } from 'react-router-dom';
import notificationStore from 'store/NotificationStore';
import introspectionStore from 'store/IntrospectionStore';
import instance, { webInstance } from 'api/utilities/axios';
import cookies from 'cookies';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Введите корректный Email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(8, 'Минимальная длина пароля - 8 символов')
    .required('Пароль обязателен')
});

const defaultTheme = createTheme();

const SignIn: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setUser } = useSanctum();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: (values) => {
      setLoading(true);
      webInstance
        .post(`/login`, {
          email: values.email,
          password: values.password
        })
        .then((val) => {
          const {
            data: { data, status }
          } = val;

          if (status) {
            setUser(data.user);
            webInstance.defaults.headers.common.Authorization = `Bearer ${data.token}`;
            instance.defaults.headers.common.Authorization = `Bearer ${data.token}`;

            cookies.set('token', data.token);

            introspectionStore.introspectRoutes().then((introVal) => {
              if (introVal.isOk) {
                val.data.forEach(async (route: any) => {
                  if (route.in_admin) {
                    await introspectionStore.introspect(route.url.slice(1));
                  }
                });
              }
            });

            navigate('/');
          } else {
            notificationStore.error('Неверный логин или пароль');
          }
        })
        .catch(() => {
          notificationStore.error('Неверный логин или пароль');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  });

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Вход
          </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={
                formik.touched.email && JSON.stringify(formik.errors.email)
              }
              autoFocus
            />
            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={
                formik.touched.password &&
                JSON.stringify(formik.errors.password)
              }
            />
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Запомнить меня"
            /> */}
            <LoadingButton
              loading={loading}
              type="submit"
              // disabled={formik.isSubmitting || !formik.isValid}
              fullWidth
              variant="contained"
              loadingIndicator="Загрузка…"
              sx={{ mt: 3, mb: 2 }}
            >
              Войти
            </LoadingButton>
            {/* <Grid container>
              <Grid item>
                <Typography paragraph>
                  Ещё нет аккаунта?{' '}
                  <RouterLink to="/signUp">Зарегистрироваться</RouterLink>
                </Typography>
              </Grid>
            </Grid> */}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default SignIn;
