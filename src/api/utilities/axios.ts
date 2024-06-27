import axios from 'axios';
import environment from 'config/environments/environment';
import cookies from 'cookies';

const token = cookies.get('token');

console.log(token);

const instance = token
  ? axios.create({
      baseURL: `${environment.serverBaseUrl}/api`,
      withCredentials: true,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxRedirects: 0,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-Bushido-Client-Identity': 'Bushido-Front'
      }
    })
  : axios.create({
      baseURL: `${environment.serverBaseUrl}/api`,
      withCredentials: true,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxRedirects: 0,
      headers: {
        Accept: 'application/json',
        'X-Bushido-Client-Identity': 'Bushido-Front'
      }
    });

export const webInstance = token
  ? axios.create({
      baseURL: environment.serverBaseUrl,
      withCredentials: true,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxRedirects: 0,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-Bushido-Client-Identity': 'Bushido-Front'
      }
    })
  : axios.create({
      baseURL: environment.serverBaseUrl,
      withCredentials: true,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxRedirects: 0,
      headers: {
        Accept: 'application/json',
        'X-Bushido-Client-Identity': 'Bushido-Front'
      }
    });

export default instance;
