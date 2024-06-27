import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ruRU } from '@mui/x-date-pickers/locales';

import environment from 'config/environments/environment';

import 'dayjs/locale/ru';

import mainTheme from 'themes';

import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter basename={environment.panelBasePath ?? '/'}>
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <LocalizationProvider
        localeText={
          ruRU.components.MuiLocalizationProvider.defaultProps.localeText
        }
        adapterLocale="ru"
        dateAdapter={AdapterDayjs}
      >
        <ThemeProvider theme={mainTheme}>
          <App />
        </ThemeProvider>
      </LocalizationProvider>
    </StyledEngineProvider>
  </BrowserRouter>
);
