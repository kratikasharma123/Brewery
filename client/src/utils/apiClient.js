import axios from 'axios';

const DEFAULT_API_BASE_URL = 'https://brewery-backend-u4hx.onrender.com';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

axios.defaults.baseURL = API_BASE_URL;

export default axios;
