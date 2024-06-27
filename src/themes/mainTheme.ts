import { createTheme, responsiveFontSizes } from '@mui/material';
import environment from 'config/environments/environment';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    customCircularProgress?: string;
  }
}

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'light',
      customCircularProgress: '#F3F5F6',
      primary: {
        main: environment.colorTheme ?? '#EF353D'
      },
      secondary: {
        main: '#f50057'
      },
      background: {
        default: '#FFFFFF',
        paper: '#F3F5F6'
      },
      divider: 'rgb(185,198,223)',
      info: {
        main: '#2196f3'
      }
    },
    typography: {
      fontFamily: [
        'Open Sans',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Oxygen Sans"',
        'Ubuntu',
        'Cantarell',
        '"Helvetica Neue"',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        'sans-serif'
      ].join(',')
    }
  })
);

export default theme;
