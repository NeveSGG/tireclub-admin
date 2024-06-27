import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/', maxAge: 604800 });

export default cookies;
