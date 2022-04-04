import axios from 'axios';
import { toast } from './toast';

import { BACKEND_URI } from './constants';
import { removeCookie } from './helpers';

const axiosInstance = axios.create({
  baseURL: BACKEND_URI,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
  params: {},
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const errMessage = error.response.data?.message;

    const { url } = originalRequest;
    if (url === '/refresh_token') {
      try {
        // to remove server side cookie refresh token
        await axios.post(BACKEND_URI + '/logout', {}, {
          withCredentials: true,
        });
      } catch (error) {
        console.error(error);
      } finally {
        removeCookie('access_token');
        removeCookie('country');
        removeCookie('is_logged_in');

        window.location.href = '/';
        return;
      }
    }

    toast.error(errMessage || `Something went wrong`);
    return Promise.reject(error);
  }
);

export default axiosInstance;
