import axios from 'axios';
import { APP_BASE_URL } from './AppUrls';
import { loader } from '../common/LoaderContext';

export const createPGAPI = () => {
  const api = axios.create({
    baseURL: APP_BASE_URL,
  });

  api.interceptors.request.use(
    (config) => {
      loader.show();
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      loader.hide();
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      loader.hide();
      return response;
    },
    (error) => {
      loader.hide();
      return Promise.reject(error);
    }
  );

  return api;
};

const api = createPGAPI();
export default api;
