import axios from 'axios';
import { APP_BASE_URL } from './AppUrls';

export const createPGAPI = () => {
  const api = axios.create({
    baseURL: APP_BASE_URL,
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return api;
};

const api = createPGAPI();
export default api;
