import axios from 'axios';
import { VERCEL_URLS } from '../config/env';

const api = axios.create({
  baseURL: VERCEL_URLS.BACKEND,
  withCredentials: true
});

export default api;
