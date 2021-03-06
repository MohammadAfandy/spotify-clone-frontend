import axios from 'axios';
import {
  getCookie,
  setCookie,
  // sleep,
} from './helpers';
import ApiBackend from './api-backend';
import { ACCESS_TOKEN_AGE, SPOTIFY_URI } from './constants';
import { toast } from './toast';

const axiosInstance = axios.create({
  baseURL: SPOTIFY_URI,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  params: {},
});

// before request, set the access token and country param
axiosInstance.interceptors.request.use(
  async (config) => {
    // await sleep(2000);
    const { url = '', method } = config;
    const urlWithoutCountry = [
      '/me/top/tracks',
      '/me/top/artists',
      '/me/player',
      '/recommendations',
    ];
    if (
      method?.toLowerCase() === 'get'
      && urlWithoutCountry.every((v) => url.startsWith(v) === false)
    ) {
      config.params.country = getCookie('country') || 'US';
      config.params.market = 'from_token';
    }

    const accessToken = getCookie('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${getCookie('access_token')}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // const refreshToken = getCookie('refresh_token');
    if (
      error.response &&
      error.config &&
      !error.config._retry
      // refreshToken
    ) {
      const isLoggedIn = getCookie('is_logged_in');
      const isExpired = (
        error.response.status === 401 &&
        error.response.data.error.message === 'The access token expired'
      );
      const accessToken = getCookie('access_token');

      // refresh token when expired or access cookie token is deleted
      if (isLoggedIn && (isExpired || !accessToken)) {
        originalRequest._retry = true;

        const response = await ApiBackend.post('/refresh_token', {}, {
          withCredentials: true,
        }).catch(console.error);
        const accessToken = response?.data?.access_token;
        if (accessToken) {
          setCookie('access_token', accessToken, { expires: ACCESS_TOKEN_AGE });
          return axiosInstance(originalRequest);
        }
      }
    }

    const errorMessage = error?.response?.data?.error?.message;
    toast.error(errorMessage || `Something went wrong`);

    return Promise.reject(error);
  }
);

export default axiosInstance;
